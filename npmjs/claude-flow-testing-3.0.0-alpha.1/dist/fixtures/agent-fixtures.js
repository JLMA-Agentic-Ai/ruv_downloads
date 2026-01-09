/**
 * @claude-flow/testing - Agent Fixtures
 *
 * Comprehensive mock agents and agent configurations for testing V3 modules.
 * Supports all 15 V3 specialized swarm agents plus core development agents.
 *
 * Based on ADR-002 (Domain-Driven Design) and V3 agent specifications.
 */
import { vi } from 'vitest';
/**
 * Capability definitions for each agent type
 */
export const agentCapabilities = {
    'queen-coordinator': [
        'orchestration',
        'task-distribution',
        'agent-management',
        'priority-scheduling',
        'conflict-resolution',
        'github-issue-management',
    ],
    'security-architect': [
        'security-design',
        'threat-modeling',
        'security-review',
        'architecture-security',
        'compliance-verification',
    ],
    'security-auditor': [
        'cve-detection',
        'vulnerability-scanning',
        'security-testing',
        'penetration-testing',
        'audit-reporting',
    ],
    'memory-specialist': [
        'memory-optimization',
        'agentdb-integration',
        'caching',
        'vector-search',
        'hnsw-indexing',
        'quantization',
    ],
    'swarm-specialist': [
        'coordination',
        'consensus',
        'communication',
        'topology-management',
        'load-balancing',
    ],
    'integration-architect': [
        'api-design',
        'system-integration',
        'compatibility',
        'agentic-flow-bridge',
        'mcp-integration',
    ],
    'performance-engineer': [
        'optimization',
        'benchmarking',
        'profiling',
        'flash-attention',
        'memory-reduction',
    ],
    'core-architect': [
        'ddd-design',
        'architecture',
        'domain-modeling',
        'bounded-contexts',
        'clean-architecture',
    ],
    'test-architect': [
        'tdd',
        'test-design',
        'quality-assurance',
        'coverage-analysis',
        'london-school',
    ],
    'project-coordinator': [
        'project-management',
        'scheduling',
        'reporting',
        'cross-domain-coordination',
        'milestone-tracking',
    ],
    'coder': [
        'coding',
        'implementation',
        'debugging',
        'refactoring',
        'code-generation',
    ],
    'reviewer': [
        'code-review',
        'quality-check',
        'suggestions',
        'best-practices',
        'security-review',
    ],
    'tester': [
        'testing',
        'test-execution',
        'coverage',
        'regression-testing',
        'integration-testing',
    ],
    'planner': [
        'planning',
        'estimation',
        'roadmap',
        'task-breakdown',
        'dependency-analysis',
    ],
    'researcher': [
        'research',
        'analysis',
        'documentation',
        'pattern-discovery',
        'knowledge-synthesis',
    ],
};
/**
 * Pre-defined agent configurations for testing
 */
export const agentConfigs = {
    // V3 Specialized Agents
    queenCoordinator: {
        type: 'queen-coordinator',
        name: 'Queen Alpha',
        capabilities: agentCapabilities['queen-coordinator'],
        priority: 100,
        metadata: { isLeader: true, domain: 'orchestration' },
        maxConcurrentTasks: 10,
        timeout: 60000,
    },
    securityArchitect: {
        type: 'security-architect',
        name: 'Security Architect',
        capabilities: agentCapabilities['security-architect'],
        priority: 95,
        metadata: { specialization: 'cve-prevention', domain: 'security' },
        maxConcurrentTasks: 3,
    },
    securityAuditor: {
        type: 'security-auditor',
        name: 'Security Auditor',
        capabilities: agentCapabilities['security-auditor'],
        priority: 95,
        metadata: { specialization: 'penetration-testing', domain: 'security' },
        maxConcurrentTasks: 2,
    },
    memorySpecialist: {
        type: 'memory-specialist',
        name: 'Memory Specialist',
        capabilities: agentCapabilities['memory-specialist'],
        priority: 85,
        metadata: { backend: 'agentdb', domain: 'memory' },
        maxConcurrentTasks: 5,
    },
    swarmSpecialist: {
        type: 'swarm-specialist',
        name: 'Swarm Specialist',
        capabilities: agentCapabilities['swarm-specialist'],
        priority: 90,
        metadata: { topology: 'hierarchical-mesh', domain: 'coordination' },
        maxConcurrentTasks: 5,
    },
    integrationArchitect: {
        type: 'integration-architect',
        name: 'Integration Architect',
        capabilities: agentCapabilities['integration-architect'],
        priority: 85,
        metadata: { agentic: true, domain: 'integration' },
    },
    performanceEngineer: {
        type: 'performance-engineer',
        name: 'Performance Engineer',
        capabilities: agentCapabilities['performance-engineer'],
        priority: 80,
        metadata: { targets: { flashAttention: '2.49x-7.47x' }, domain: 'performance' },
    },
    coreArchitect: {
        type: 'core-architect',
        name: 'Core Architect',
        capabilities: agentCapabilities['core-architect'],
        priority: 85,
        metadata: { pattern: 'ddd', domain: 'core' },
    },
    testArchitect: {
        type: 'test-architect',
        name: 'Test Architect',
        capabilities: agentCapabilities['test-architect'],
        priority: 80,
        metadata: { methodology: 'london-school', domain: 'testing' },
    },
    projectCoordinator: {
        type: 'project-coordinator',
        name: 'Project Coordinator',
        capabilities: agentCapabilities['project-coordinator'],
        priority: 75,
        metadata: { domain: 'project-management' },
    },
    // Core Development Agents
    coder: {
        type: 'coder',
        name: 'Coder Agent',
        capabilities: agentCapabilities['coder'],
        priority: 70,
    },
    tester: {
        type: 'tester',
        name: 'Tester Agent',
        capabilities: agentCapabilities['tester'],
        priority: 70,
    },
    reviewer: {
        type: 'reviewer',
        name: 'Reviewer Agent',
        capabilities: agentCapabilities['reviewer'],
        priority: 75,
    },
    planner: {
        type: 'planner',
        name: 'Planner Agent',
        capabilities: agentCapabilities['planner'],
        priority: 75,
    },
    researcher: {
        type: 'researcher',
        name: 'Researcher Agent',
        capabilities: agentCapabilities['researcher'],
        priority: 65,
    },
};
/**
 * Pre-defined agent instances for testing
 */
export const agentInstances = {
    idleQueen: {
        id: 'agent-queen-001',
        type: 'queen-coordinator',
        name: 'Queen Alpha',
        status: 'idle',
        capabilities: agentCapabilities['queen-coordinator'],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        metrics: {
            tasksCompleted: 150,
            tasksFailed: 2,
            avgTaskDuration: 250,
            totalDuration: 37500,
            errorRate: 0.013,
            memoryUsageMb: 128,
        },
    },
    busySecurityArchitect: {
        id: 'agent-security-001',
        type: 'security-architect',
        name: 'Security Architect',
        status: 'busy',
        capabilities: agentCapabilities['security-architect'],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        lastActiveAt: new Date('2024-01-15T12:00:00Z'),
        currentTaskId: 'task-security-audit-001',
        metrics: {
            tasksCompleted: 45,
            tasksFailed: 0,
            avgTaskDuration: 5000,
            totalDuration: 225000,
            errorRate: 0,
            memoryUsageMb: 256,
        },
    },
    idleMemorySpecialist: {
        id: 'agent-memory-001',
        type: 'memory-specialist',
        name: 'Memory Specialist',
        status: 'idle',
        capabilities: agentCapabilities['memory-specialist'],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        metrics: {
            tasksCompleted: 200,
            tasksFailed: 5,
            avgTaskDuration: 100,
            totalDuration: 20000,
            errorRate: 0.025,
            memoryUsageMb: 512,
        },
    },
    terminatedCoder: {
        id: 'agent-coder-001',
        type: 'coder',
        name: 'Coder Agent',
        status: 'terminated',
        capabilities: agentCapabilities['coder'],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        lastActiveAt: new Date('2024-01-10T08:00:00Z'),
        metrics: {
            tasksCompleted: 80,
            tasksFailed: 3,
            avgTaskDuration: 3000,
            totalDuration: 240000,
            errorRate: 0.036,
            memoryUsageMb: 0,
        },
    },
    errorPerformanceEngineer: {
        id: 'agent-perf-001',
        type: 'performance-engineer',
        name: 'Performance Engineer',
        status: 'error',
        capabilities: agentCapabilities['performance-engineer'],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        lastActiveAt: new Date('2024-01-15T10:00:00Z'),
        currentTaskId: 'task-benchmark-001',
        metrics: {
            tasksCompleted: 30,
            tasksFailed: 5,
            avgTaskDuration: 10000,
            totalDuration: 300000,
            errorRate: 0.143,
            memoryUsageMb: 1024,
        },
    },
    startingSwarmSpecialist: {
        id: 'agent-swarm-001',
        type: 'swarm-specialist',
        name: 'Swarm Specialist',
        status: 'starting',
        capabilities: agentCapabilities['swarm-specialist'],
        createdAt: new Date(),
    },
};
/**
 * Default agent permissions for testing
 */
export const agentPermissions = {
    full: {
        canSpawnAgents: true,
        canTerminateAgents: true,
        canAccessFiles: true,
        canExecuteCommands: true,
        canAccessNetwork: true,
        canAccessMemory: true,
    },
    restricted: {
        canSpawnAgents: false,
        canTerminateAgents: false,
        canAccessFiles: true,
        canExecuteCommands: false,
        canAccessNetwork: false,
        canAccessMemory: true,
        allowedPaths: ['./v3/', './src/'],
        blockedPaths: ['/etc/', '/tmp/', '~/', '../'],
    },
    readOnly: {
        canSpawnAgents: false,
        canTerminateAgents: false,
        canAccessFiles: true,
        canExecuteCommands: false,
        canAccessNetwork: false,
        canAccessMemory: true,
        maxMemoryMb: 256,
    },
    coordinator: {
        canSpawnAgents: true,
        canTerminateAgents: true,
        canAccessFiles: true,
        canExecuteCommands: true,
        canAccessNetwork: true,
        canAccessMemory: true,
        maxMemoryMb: 2048,
        maxCpuPercent: 50,
    },
};
/**
 * Factory function to create agent config with overrides
 */
export function createAgentConfig(base, overrides) {
    const baseConfig = typeof base === 'string' && base in agentConfigs
        ? agentConfigs[base]
        : {
            type: base,
            name: `${base} Agent`,
            capabilities: agentCapabilities[base] ?? [],
        };
    return {
        ...baseConfig,
        ...overrides,
    };
}
/**
 * Factory function to create agent instance with overrides
 */
export function createAgentInstance(base, overrides) {
    const baseInstance = typeof base === 'string' && base in agentInstances
        ? agentInstances[base]
        : {
            id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type: base,
            name: `${base} Agent`,
            status: 'idle',
            capabilities: agentCapabilities[base] ?? [],
            createdAt: new Date(),
        };
    return {
        ...baseInstance,
        ...overrides,
        id: overrides?.id ?? baseInstance.id ?? `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: overrides?.createdAt ?? baseInstance.createdAt ?? new Date(),
    };
}
/**
 * Factory function to create spawn result
 */
export function createAgentSpawnResult(agent, overrides) {
    const fullAgent = createAgentInstance(agent.type ?? 'coder', agent);
    return {
        agent: fullAgent,
        sessionId: `session-${Date.now()}`,
        startupTime: Math.random() * 100 + 50,
        success: true,
        ...overrides,
    };
}
/**
 * Factory function to create termination result
 */
export function createAgentTerminationResult(agentId, overrides) {
    return {
        agentId,
        success: true,
        duration: Math.random() * 50 + 10,
        tasksTerminated: 0,
        ...overrides,
    };
}
/**
 * Factory function to create health check result
 */
export function createAgentHealthCheckResult(agentId, overrides) {
    return {
        agentId,
        status: 'idle',
        healthy: true,
        lastActivity: new Date(),
        metrics: {
            tasksCompleted: 50,
            tasksFailed: 1,
            avgTaskDuration: 200,
            totalDuration: 10000,
            errorRate: 0.02,
            memoryUsageMb: 128,
        },
        ...overrides,
    };
}
/**
 * Create a full 15-agent V3 swarm configuration
 */
export function createV3SwarmAgentConfigs() {
    return [
        agentConfigs.queenCoordinator,
        agentConfigs.securityArchitect,
        agentConfigs.securityAuditor,
        agentConfigs.memorySpecialist,
        agentConfigs.swarmSpecialist,
        agentConfigs.integrationArchitect,
        agentConfigs.performanceEngineer,
        agentConfigs.coreArchitect,
        agentConfigs.testArchitect,
        agentConfigs.projectCoordinator,
        agentConfigs.coder,
        agentConfigs.reviewer,
        agentConfigs.tester,
        agentConfigs.planner,
        agentConfigs.researcher,
    ];
}
/**
 * Create instances for all 15 V3 agents
 */
export function createV3SwarmAgentInstances() {
    return createV3SwarmAgentConfigs().map((config, index) => createAgentInstance(config.type, {
        id: `v3-agent-${config.type}-${index}`,
        name: config.name,
        status: 'idle',
        capabilities: config.capabilities,
    }));
}
/**
 * Create agents grouped by domain
 */
export function createAgentsByDomain() {
    return {
        security: [agentConfigs.securityArchitect, agentConfigs.securityAuditor],
        core: [agentConfigs.coreArchitect, agentConfigs.coder, agentConfigs.reviewer],
        memory: [agentConfigs.memorySpecialist],
        coordination: [agentConfigs.queenCoordinator, agentConfigs.swarmSpecialist],
        integration: [agentConfigs.integrationArchitect],
        performance: [agentConfigs.performanceEngineer],
        testing: [agentConfigs.testArchitect, agentConfigs.tester],
        planning: [agentConfigs.projectCoordinator, agentConfigs.planner, agentConfigs.researcher],
    };
}
/**
 * Invalid agent configurations for error testing
 */
export const invalidAgentConfigs = {
    emptyName: {
        type: 'coder',
        name: '',
        capabilities: ['coding'],
    },
    noCapabilities: {
        type: 'coder',
        name: 'Invalid Agent',
        capabilities: [],
    },
    invalidType: {
        type: 'invalid-type',
        name: 'Invalid Agent',
        capabilities: ['something'],
    },
    negativePriority: {
        type: 'coder',
        name: 'Invalid Agent',
        capabilities: ['coding'],
        priority: -1,
    },
    zeroTimeout: {
        type: 'coder',
        name: 'Invalid Agent',
        capabilities: ['coding'],
        timeout: 0,
    },
    excessiveConcurrency: {
        type: 'coder',
        name: 'Invalid Agent',
        capabilities: ['coding'],
        maxConcurrentTasks: 1000,
    },
};
/**
 * Create a mock agent for testing
 */
export function createMockAgent(type = 'coder', overrides) {
    const instance = createAgentInstance(type, overrides);
    return {
        id: instance.id,
        type: instance.type,
        status: instance.status,
        capabilities: instance.capabilities,
        execute: vi.fn().mockResolvedValue({ success: true }),
        communicate: vi.fn().mockResolvedValue(undefined),
        terminate: vi.fn().mockResolvedValue(undefined),
        getMetrics: vi.fn().mockReturnValue(instance.metrics ?? {
            tasksCompleted: 0,
            tasksFailed: 0,
            avgTaskDuration: 0,
            totalDuration: 0,
            errorRate: 0,
            memoryUsageMb: 64,
        }),
    };
}
/**
 * Create multiple mock agents
 */
export function createMockAgents(types) {
    return types.map(type => createMockAgent(type));
}
/**
 * Create a mock V3 15-agent swarm
 */
export function createMockV3Swarm() {
    const types = [
        'queen-coordinator',
        'security-architect',
        'security-auditor',
        'memory-specialist',
        'swarm-specialist',
        'integration-architect',
        'performance-engineer',
        'core-architect',
        'test-architect',
        'project-coordinator',
        'coder',
        'reviewer',
        'tester',
        'planner',
        'researcher',
    ];
    return createMockAgents(types);
}
//# sourceMappingURL=agent-fixtures.js.map