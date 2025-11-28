/**
 * ROS3 MCP Server implementation - Simplified version
 */
export interface ROS3McpServerConfig {
    name?: string;
    version?: string;
    dbPath?: string;
}
export declare class ROS3McpServer {
    private ros3;
    private memory;
    private name;
    private version;
    constructor(config?: ROS3McpServerConfig);
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
    }): Promise<string>;
    getPose(): Promise<string>;
    getStatus(): Promise<string>;
    readLidar(params: {
        filter?: string;
        max_points?: number;
    }): Promise<string>;
    detectObjects(params: {
        camera: string;
        confidence_threshold?: number;
    }): Promise<string>;
    queryMemory(params: {
        query: string;
        k?: number;
        only_successes?: boolean;
        min_confidence?: number;
    }): Promise<string>;
    consolidateSkills(params?: {
        min_attempts?: number;
        min_reward?: number;
        time_window_days?: number;
    }): Promise<string>;
    getMemoryStats(): Promise<string>;
    getInfo(): {
        name: string;
        version: string;
        tools: string[];
    };
}
//# sourceMappingURL=server.d.ts.map