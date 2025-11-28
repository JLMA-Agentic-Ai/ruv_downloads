#!/usr/bin/env node
/**
 * IRIS Prime MCP Server
 *
 * Model Context Protocol server for IRIS Prime AI Operations Orchestrator
 * Follows FoxRev ReasoningBank pattern - runs programmatically, results loaded into model context
 *
 * Key Design:
 * - MCP tools are called PROGRAMMATICALLY (not directly by Claude)
 * - Results are loaded into model context as text
 * - Keeps heavy operations OUT of Claude's direct context
 * - Claude gets the RESULTS, not the direct MCP connection
 *
 * @author FoxRuv
 * @license MIT
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { irisPrime } from '../orchestrators/iris-prime.js';
import { initSupabaseFromEnv } from '../supabase/index.js';
import { createReflexionMonitor } from '../reflexion/reflexion-monitor.js';
import { createPatternDiscovery } from '../patterns/pattern-discovery.js';
import { createConsensusLineageTracker } from '../consensus/lineage-tracker.js';
import { createGlobalMetrics } from '../telemetry/global-metrics.js';
// ============================================================================
// Initialize Services
// ============================================================================
let initialized = false;
async function ensureInitialized() {
    if (!initialized) {
        await initSupabaseFromEnv();
        initialized = true;
    }
}
// ============================================================================
// MCP Server Setup
// ============================================================================
const server = new Server({
    name: 'iris-prime',
    version: '1.0.0'
}, {
    capabilities: {
        tools: {}
    }
});
// ============================================================================
// Tool Request Handler
// ============================================================================
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    await ensureInitialized();
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            // ======================================================================
            // IRIS Prime Evaluation Tools
            // ======================================================================
            case 'iris_evaluate_project': {
                const { projectId } = args;
                if (!projectId) {
                    throw new McpError(ErrorCode.InvalidParams, 'projectId is required');
                }
                const report = await irisPrime.evaluateProject(projectId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(report, null, 2)
                        }
                    ]
                };
            }
            case 'iris_evaluate_all': {
                const crossReport = await irisPrime.evaluateAllProjects();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(crossReport, null, 2)
                        }
                    ]
                };
            }
            // ======================================================================
            // Drift Detection Tools
            // ======================================================================
            case 'iris_detect_drift': {
                const { reflexionId } = args;
                if (!reflexionId) {
                    throw new McpError(ErrorCode.InvalidParams, 'reflexionId is required');
                }
                const reflexionMonitor = createReflexionMonitor({});
                const driftResult = await reflexionMonitor.detectDrift(reflexionId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(driftResult, null, 2)
                        }
                    ]
                };
            }
            // ======================================================================
            // Pattern Discovery Tools
            // ======================================================================
            case 'iris_find_patterns': {
                const { projectId } = args;
                const patternDiscovery = createPatternDiscovery({});
                const patterns = await patternDiscovery.getProjectPatterns(projectId || 'default');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(patterns, null, 2)
                        }
                    ]
                };
            }
            case 'iris_recommend_transfers': {
                const { sourceProjectId, targetProjectId } = args;
                if (!sourceProjectId || !targetProjectId) {
                    throw new McpError(ErrorCode.InvalidParams, 'sourceProjectId and targetProjectId are required');
                }
                const recommendations = await irisPrime.findTransferablePatterns(sourceProjectId, { targetProject: targetProjectId });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(recommendations, null, 2)
                        }
                    ]
                };
            }
            // ======================================================================
            // Expert Statistics Tools
            // ======================================================================
            case 'iris_get_expert_stats': {
                const { projectId, expertId, version } = args;
                if (!projectId || !expertId || !version) {
                    throw new McpError(ErrorCode.InvalidParams, 'projectId, expertId, and version are required');
                }
                const globalMetrics = createGlobalMetrics({});
                const stats = await globalMetrics.getExpertMetrics(projectId, expertId, version);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(stats, null, 2)
                        }
                    ]
                };
            }
            case 'iris_get_cross_project_metrics': {
                const { expertType } = args;
                const globalMetrics = createGlobalMetrics({});
                const metrics = await globalMetrics.getCrossProjectMetrics(expertType || 'all');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(metrics, null, 2)
                        }
                    ]
                };
            }
            // ======================================================================
            // Auto-Retraining Tools
            // ======================================================================
            case 'iris_auto_retrain': {
                const { projectId } = args;
                if (!projectId) {
                    throw new McpError(ErrorCode.InvalidParams, 'projectId is required');
                }
                const retrainReport = await irisPrime.autoRetrainExperts(projectId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(retrainReport, null, 2)
                        }
                    ]
                };
            }
            // ======================================================================
            // Consensus Lineage Tools
            // ======================================================================
            case 'iris_consensus_lineage': {
                const { expertId, projectId } = args;
                if (!expertId) {
                    throw new McpError(ErrorCode.InvalidParams, 'expertId is required');
                }
                const lineageTracker = createConsensusLineageTracker({});
                const lineage = await lineageTracker.getVersionLineage(expertId, projectId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(lineage, null, 2)
                        }
                    ]
                };
            }
            case 'iris_rotation_recommendations': {
                const { projectId } = args;
                if (!projectId) {
                    throw new McpError(ErrorCode.InvalidParams, 'projectId is required');
                }
                const lineageTracker = createConsensusLineageTracker({});
                const recommendations = await lineageTracker.generateRotationRecommendations(projectId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(recommendations, null, 2)
                        }
                    ]
                };
            }
            // ======================================================================
            // Reflexion Search Tools
            // ======================================================================
            case 'iris_reflexion_search': {
                const { query, limit } = args;
                if (!query) {
                    throw new McpError(ErrorCode.InvalidParams, 'query is required');
                }
                const reflexionMonitor = createReflexionMonitor({});
                const results = await reflexionMonitor.findSimilarReflexions(query, (limit || 10) / 100 // Convert limit to threshold
                );
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(results, null, 2)
                        }
                    ]
                };
            }
            case 'iris_compare_reflexions': {
                const { reflexionId1, reflexionId2 } = args;
                if (!reflexionId1 || !reflexionId2) {
                    throw new McpError(ErrorCode.InvalidParams, 'reflexionId1 and reflexionId2 are required');
                }
                const reflexionMonitor = createReflexionMonitor({});
                const [ref1, ref2] = await Promise.all([
                    reflexionMonitor.getReflexion(reflexionId1),
                    reflexionMonitor.getReflexion(reflexionId2)
                ]);
                const comparison = {
                    reflexion1: ref1,
                    reflexion2: ref2,
                    validityDifference: (ref1?.validityScore || 0) - (ref2?.validityScore || 0),
                    usageDifference: (ref1?.usageCount || 0) - (ref2?.usageCount || 0)
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(comparison, null, 2)
                        }
                    ]
                };
            }
            // ======================================================================
            // Health Check Tool
            // ======================================================================
            case 'iris_health_check': {
                const healthStatus = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    services: {
                        supabase: initialized,
                        irisPrime: !!irisPrime
                    }
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(healthStatus, null, 2)
                        }
                    ]
                };
            }
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof McpError) {
            throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
});
// ============================================================================
// List Tools Handler
// ============================================================================
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            // ======================================================================
            // IRIS Prime Evaluation Tools
            // ======================================================================
            {
                name: 'iris_evaluate_project',
                description: 'Evaluate project health with IRIS Prime - analyzes drift, patterns, and expert performance',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'Project identifier to evaluate'
                        }
                    },
                    required: ['projectId']
                }
            },
            {
                name: 'iris_evaluate_all',
                description: 'Run cross-project evaluation across all projects',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            // ======================================================================
            // Drift Detection Tools
            // ======================================================================
            {
                name: 'iris_detect_drift',
                description: 'Detect reflexion drift for a specific reflexion ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reflexionId: {
                            type: 'string',
                            description: 'Reflexion ID to check for drift'
                        }
                    },
                    required: ['reflexionId']
                }
            },
            // ======================================================================
            // Pattern Discovery Tools
            // ======================================================================
            {
                name: 'iris_find_patterns',
                description: 'Find learned patterns for a project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'Project ID to find patterns for'
                        }
                    }
                }
            },
            {
                name: 'iris_recommend_transfers',
                description: 'Recommend pattern transfers between projects',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourceProjectId: {
                            type: 'string',
                            description: 'Source project ID'
                        },
                        targetProjectId: {
                            type: 'string',
                            description: 'Target project ID'
                        }
                    },
                    required: ['sourceProjectId', 'targetProjectId']
                }
            },
            // ======================================================================
            // Expert Statistics Tools
            // ======================================================================
            {
                name: 'iris_get_expert_stats',
                description: 'Get expert performance statistics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'Project ID'
                        },
                        expertId: {
                            type: 'string',
                            description: 'Expert ID'
                        },
                        version: {
                            type: 'string',
                            description: 'Expert version'
                        }
                    },
                    required: ['projectId', 'expertId', 'version']
                }
            },
            {
                name: 'iris_get_cross_project_metrics',
                description: 'Get cross-project performance metrics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        expertType: {
                            type: 'string',
                            description: 'Expert type filter (optional)'
                        }
                    }
                }
            },
            // ======================================================================
            // Auto-Retraining Tools
            // ======================================================================
            {
                name: 'iris_auto_retrain',
                description: 'Trigger automatic retraining for a project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'Project ID to retrain experts for'
                        }
                    },
                    required: ['projectId']
                }
            },
            // ======================================================================
            // Consensus Lineage Tools
            // ======================================================================
            {
                name: 'iris_consensus_lineage',
                description: 'Get version lineage and consensus history for an expert',
                inputSchema: {
                    type: 'object',
                    properties: {
                        expertId: {
                            type: 'string',
                            description: 'Expert ID to trace'
                        },
                        projectId: {
                            type: 'string',
                            description: 'Optional project ID filter'
                        }
                    },
                    required: ['expertId']
                }
            },
            {
                name: 'iris_rotation_recommendations',
                description: 'Get expert rotation recommendations based on consensus patterns',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'Project ID'
                        }
                    },
                    required: ['projectId']
                }
            },
            // ======================================================================
            // Reflexion Search Tools
            // ======================================================================
            {
                name: 'iris_reflexion_search',
                description: 'Search for similar reflexions using vector similarity',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query'
                        },
                        projectId: {
                            type: 'string',
                            description: 'Optional project ID filter'
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum results (default: 10)',
                            default: 10
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'iris_compare_reflexions',
                description: 'Compare two reflexions and analyze differences',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reflexionId1: {
                            type: 'string',
                            description: 'First reflexion ID'
                        },
                        reflexionId2: {
                            type: 'string',
                            description: 'Second reflexion ID'
                        }
                    },
                    required: ['reflexionId1', 'reflexionId2']
                }
            },
            // ======================================================================
            // Health Check Tool
            // ======================================================================
            {
                name: 'iris_health_check',
                description: 'Check IRIS Prime server health and service status',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ]
    };
});
// ============================================================================
// Server Startup
// ============================================================================
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('IRIS Prime MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
