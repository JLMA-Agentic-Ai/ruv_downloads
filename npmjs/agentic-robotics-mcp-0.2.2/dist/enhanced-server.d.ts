/**
 * Enhanced ROS3 MCP Server
 *
 * Integrates:
 * - AgentDB (20 MCP tools, 150x faster memory)
 * - agentic-flow (66 agents, 213 MCP tools)
 * - Reflexion memory with self-critique
 * - Skill library with semantic search
 * - Multi-robot swarm coordination
 * - Causal reasoning
 */
export interface EnhancedROS3McpServerConfig {
    name?: string;
    version?: string;
    dbPath?: string;
    enableFlow?: boolean;
    numAgents?: number;
    enableReasoning?: boolean;
    enableLearning?: boolean;
}
export declare class EnhancedROS3McpServer {
    private ros3;
    private memory;
    private orchestrator?;
    private name;
    private version;
    private config;
    constructor(config?: EnhancedROS3McpServerConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    moveRobot(params: {
        x: number;
        y: number;
        z: number;
        roll: number;
        pitch: number;
        yaw: number;
        speed?: number;
        frame?: 'base' | 'world';
        useMemory?: boolean;
    }): Promise<string>;
    getPose(): Promise<string>;
    getStatus(): Promise<string>;
    readLidar(params: {
        filter?: string;
        max_points?: number;
        useMemory?: boolean;
    }): Promise<string>;
    detectObjects(params: {
        camera: string;
        confidence_threshold?: number;
        useMemory?: boolean;
    }): Promise<string>;
    queryMemory(params: {
        query: string;
        k?: number;
        only_successes?: boolean;
        min_confidence?: number;
        enable_reasoning?: boolean;
    }): Promise<string>;
    searchSkills(params: {
        query: string;
        k?: number;
        min_success_rate?: number;
        sort_by?: string;
    }): Promise<string>;
    consolidateSkills(params?: {
        min_attempts?: number;
        min_reward?: number;
        time_window_days?: number;
        enable_pruning?: boolean;
    }): Promise<string>;
    getMemoryStats(): Promise<string>;
    optimizeMemory(): Promise<string>;
    executeTask(params: {
        task_type: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        task_params: Record<string, any>;
        timeout?: number;
    }): Promise<string>;
    executeSwarm(params: {
        tasks: Array<{
            type: string;
            priority: string;
            params: Record<string, any>;
        }>;
    }): Promise<string>;
    coordinateRobots(params: {
        robots: string[];
        mission_type: string;
        objectives: string[];
        constraints?: Record<string, any>;
    }): Promise<string>;
    reasonAboutTask(params: {
        context: string;
        use_memory?: boolean;
        synthesize_strategy?: boolean;
        explain_reasoning?: boolean;
    }): Promise<string>;
    listMcpTools(): Promise<string>;
    queryWithReasoning(params: {
        query: string;
        k?: number;
        domain?: string;
    }): Promise<string>;
    benchmark(params?: {
        iterations?: number;
    }): Promise<string>;
    getInfo(): {
        name: string;
        version: string;
        tools: string[];
        features: {
            agentdb: boolean;
            agenticFlow: boolean | undefined;
            numAgents: number | undefined;
            reasoningEnabled: boolean | undefined;
            learningEnabled: boolean | undefined;
        };
    };
}
//# sourceMappingURL=enhanced-server.d.ts.map