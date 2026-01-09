/**
 * V3 Topology Manager
 * Manages swarm network topology with support for mesh, hierarchical, centralized, and hybrid modes
 */
import { EventEmitter } from 'events';
import { TopologyConfig, TopologyState, TopologyNode, TopologyPartition, ITopologyManager } from './types.js';
export declare class TopologyManager extends EventEmitter implements ITopologyManager {
    private config;
    private state;
    private nodeIndex;
    private adjacencyList;
    private lastRebalance;
    private roleIndex;
    private queenNode;
    private coordinatorNode;
    constructor(config?: Partial<TopologyConfig>);
    initialize(config?: TopologyConfig): Promise<void>;
    getState(): TopologyState;
    addNode(agentId: string, role: TopologyNode['role']): Promise<TopologyNode>;
    removeNode(agentId: string): Promise<void>;
    updateNode(agentId: string, updates: Partial<TopologyNode>): Promise<void>;
    getLeader(): string | undefined;
    electLeader(): Promise<string>;
    rebalance(): Promise<void>;
    getNeighbors(agentId: string): string[];
    findOptimalPath(from: string, to: string): string[];
    private determineRole;
    private hasQueen;
    private calculateInitialConnections;
    private createEdgesForNode;
    private updatePartitions;
    private shouldRebalance;
    private rebalanceMesh;
    private rebalanceHierarchical;
    private rebalanceCentralized;
    private rebalanceHybrid;
    /**
     * Add node to role index
     */
    private addToRoleIndex;
    /**
     * Remove node from role index
     */
    private removeFromRoleIndex;
    /**
     * Get queen node with O(1) lookup
     */
    getQueen(): TopologyNode | undefined;
    /**
     * Get coordinator node with O(1) lookup
     */
    getCoordinator(): TopologyNode | undefined;
    getNode(agentId: string): TopologyNode | undefined;
    getNodesByRole(role: TopologyNode['role']): TopologyNode[];
    getActiveNodes(): TopologyNode[];
    getPartition(partitionId: string): TopologyPartition | undefined;
    isConnected(from: string, to: string): boolean;
    getConnectionCount(): number;
    getAverageConnections(): number;
}
export declare function createTopologyManager(config?: Partial<TopologyConfig>): TopologyManager;
//# sourceMappingURL=topology-manager.d.ts.map