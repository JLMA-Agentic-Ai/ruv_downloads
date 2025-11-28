"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuDagMcpServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const schemas = __importStar(require("./types/schemas.js"));
const tools = __importStar(require("./tools/index.js"));
const index_js_2 = require("./resources/index.js");
const helpers_js_1 = require("./utils/helpers.js");
/**
 * QuDAG MCP Server
 *
 * Provides quantum-resistant operations through the Model Context Protocol
 */
class QuDagMcpServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'qudag-mcp-stdio',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'execute_quantum_dag',
                        description: 'Execute quantum circuit operations on the QuDAG topology with consensus validation',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                circuit: { type: 'object' },
                                execution: { type: 'object' },
                                consensus: { type: 'object' },
                                metadata: { type: 'object' },
                            },
                            required: ['circuit'],
                        },
                    },
                    {
                        name: 'optimize_circuit',
                        description: 'Optimize quantum circuit topology for QuDAG execution',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                circuit: { type: 'object' },
                                optimization: { type: 'object' },
                                dag_optimization: { type: 'object' },
                            },
                            required: ['circuit', 'optimization'],
                        },
                    },
                    {
                        name: 'analyze_complexity',
                        description: 'Analyze quantum circuit complexity and resource requirements',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                circuit: { type: 'object' },
                                analysis: { type: 'object' },
                            },
                            required: ['circuit', 'analysis'],
                        },
                    },
                    {
                        name: 'benchmark_performance',
                        description: 'Benchmark quantum circuit execution performance on QuDAG',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                circuit: { type: 'object' },
                                benchmark: { type: 'object' },
                                metrics: { type: 'object' },
                            },
                            required: ['circuit', 'benchmark'],
                        },
                    },
                    {
                        name: 'quantum_key_exchange',
                        description: 'Perform quantum-resistant key exchange using ML-KEM',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                algorithm: { type: 'string', enum: ['ml-kem-512', 'ml-kem-768', 'ml-kem-1024'] },
                                role: { type: 'string', enum: ['initiator', 'responder'] },
                                encapsulated_key: { type: 'string' },
                                options: { type: 'object' },
                                dag_storage: { type: 'object' },
                            },
                            required: ['algorithm', 'role'],
                        },
                    },
                    {
                        name: 'quantum_sign',
                        description: 'Create quantum-resistant digital signatures using ML-DSA',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                data: { type: 'string' },
                                algorithm: { type: 'string', enum: ['ml-dsa-44', 'ml-dsa-65', 'ml-dsa-87'] },
                                private_key: { type: 'string' },
                                options: { type: 'object' },
                                dag_storage: { type: 'object' },
                            },
                            required: ['data', 'algorithm', 'private_key'],
                        },
                    },
                    {
                        name: 'dark_address_resolve',
                        description: 'Resolve .dark domain addresses to network endpoints',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                address: { type: 'string' },
                                options: { type: 'object' },
                                network: { type: 'object' },
                            },
                            required: ['address'],
                        },
                    },
                    {
                        name: 'vault_quantum_store',
                        description: 'Store secrets in vault with quantum-resistant encryption',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                secret: { type: 'object' },
                                encryption: { type: 'object' },
                                access_control: { type: 'object' },
                                dag_storage: { type: 'object' },
                            },
                            required: ['secret', 'encryption'],
                        },
                    },
                    {
                        name: 'vault_quantum_retrieve',
                        description: 'Retrieve secrets from vault with quantum-resistant decryption',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                entry: { type: 'object' },
                                authentication: { type: 'object' },
                                decryption: { type: 'object' },
                            },
                            required: ['entry', 'authentication'],
                        },
                    },
                    {
                        name: 'system_health_check',
                        description: 'Perform comprehensive health check of QuDAG system',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                components: { type: 'object' },
                                depth: { type: 'string', enum: ['basic', 'detailed', 'comprehensive'] },
                                performance_tests: { type: 'object' },
                            },
                        },
                    },
                ],
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;
                let result;
                switch (name) {
                    case 'execute_quantum_dag': {
                        const input = schemas.ExecuteQuantumDagInputSchema.parse(args);
                        result = await tools.executeQuantumDag(input);
                        break;
                    }
                    case 'optimize_circuit': {
                        const input = schemas.OptimizeCircuitInputSchema.parse(args);
                        result = await tools.optimizeCircuit(input);
                        break;
                    }
                    case 'analyze_complexity': {
                        const input = schemas.AnalyzeComplexityInputSchema.parse(args);
                        result = await tools.analyzeComplexity(input);
                        break;
                    }
                    case 'benchmark_performance': {
                        const input = schemas.BenchmarkPerformanceInputSchema.parse(args);
                        result = await tools.benchmarkPerformance(input);
                        break;
                    }
                    case 'quantum_key_exchange': {
                        const input = schemas.QuantumKeyExchangeInputSchema.parse(args);
                        result = await tools.quantumKeyExchange(input);
                        break;
                    }
                    case 'quantum_sign': {
                        const input = schemas.QuantumSignInputSchema.parse(args);
                        result = await tools.quantumSign(input);
                        break;
                    }
                    case 'dark_address_resolve': {
                        const input = schemas.DarkAddressResolveInputSchema.parse(args);
                        result = await tools.darkAddressResolve(input);
                        break;
                    }
                    case 'vault_quantum_store': {
                        const input = schemas.VaultQuantumStoreInputSchema.parse(args);
                        result = await tools.vaultQuantumStore(input);
                        break;
                    }
                    case 'vault_quantum_retrieve': {
                        const input = schemas.VaultQuantumRetrieveInputSchema.parse(args);
                        result = await tools.vaultQuantumRetrieve(input);
                        break;
                    }
                    case 'system_health_check': {
                        const input = schemas.SystemHealthCheckInputSchema.parse(args);
                        result = await tools.systemHealthCheck(input);
                        break;
                    }
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const errorInfo = (0, helpers_js_1.formatError)(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ error: errorInfo }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
        // List available resources
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => {
            return {
                resources: (0, index_js_2.listResourceTemplates)(),
            };
        });
        // Read resource
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            try {
                const { uri } = request.params;
                const resource = (0, index_js_2.getResource)(uri);
                return {
                    contents: [resource],
                };
            }
            catch (error) {
                const errorInfo = (0, helpers_js_1.formatError)(error);
                throw new Error(errorInfo.message);
            }
        });
    }
    async connect() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        // Log startup message to stderr (stdout is used for MCP protocol)
        console.error('QuDAG MCP STDIO server started');
    }
    getServer() {
        return this.server;
    }
}
exports.QuDagMcpServer = QuDagMcpServer;
//# sourceMappingURL=server.js.map