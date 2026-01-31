"use strict";
/**
 * Swarm-Based Inventory Policy Optimizer
 *
 * Features:
 * - Particle Swarm Optimization for (s,S) policies
 * - Multi-objective optimization (cost vs service level)
 * - Adaptive policy learning
 * - Parallel policy evaluation
 * - Self-learning service level targets
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwarmPolicyOptimizer = void 0;
const agentic_flow_1 = require("agentic-flow");
const inventory_optimizer_1 = require("./inventory-optimizer");
class SwarmPolicyOptimizer {
    forecaster;
    optimizer;
    config;
    swarm;
    globalBest;
    agenticFlow;
    constructor(forecaster, optimizer, config) {
        this.forecaster = forecaster;
        this.optimizer = optimizer;
        this.config = config;
        this.swarm = [];
        this.globalBest = null;
        this.agenticFlow = new agentic_flow_1.AgenticFlow({
            maxAgents: config.particles,
            topology: 'mesh',
        });
    }
    /**
     * Initialize swarm with random particles
     */
    initializeSwarm() {
        this.swarm = [];
        for (let i = 0; i < this.config.particles; i++) {
            const particle = {
                id: `particle_${i}`,
                position: {
                    reorderPoint: this.randomInRange(this.config.bounds.reorderPoint),
                    orderUpToLevel: this.randomInRange(this.config.bounds.orderUpToLevel),
                    safetyFactor: this.randomInRange(this.config.bounds.safetyFactor),
                },
                velocity: {
                    reorderPoint: 0,
                    orderUpToLevel: 0,
                    safetyFactor: 0,
                },
                fitness: {
                    cost: Infinity,
                    serviceLevel: 0,
                    combined: Infinity,
                },
                personalBest: {
                    position: { reorderPoint: 0, orderUpToLevel: 0, safetyFactor: 0 },
                    fitness: { cost: Infinity, serviceLevel: 0, combined: Infinity },
                },
            };
            this.swarm.push(particle);
        }
    }
    /**
     * Optimize inventory policies using swarm intelligence
     */
    async optimize(productId, currentFeatures) {
        this.initializeSwarm();
        const convergenceHistory = [];
        // Main PSO loop
        for (let iteration = 0; iteration < this.config.iterations; iteration++) {
            // Evaluate fitness of all particles in parallel
            await this.evaluateSwarm(productId, currentFeatures);
            // Update personal and global bests
            this.updateBests();
            // Update velocities and positions
            this.updateSwarm();
            // Track convergence
            const avgFitness = this.swarm.reduce((sum, p) => sum + p.fitness.combined, 0) / this.swarm.length;
            convergenceHistory.push(avgFitness);
            // Log progress
            console.log(`Iteration ${iteration + 1}/${this.config.iterations}: ` +
                `Best Fitness = ${this.globalBest?.fitness.combined.toFixed(2)}, ` +
                `Avg Fitness = ${avgFitness.toFixed(2)}`);
        }
        return {
            bestPolicy: this.globalBest.position,
            bestFitness: this.globalBest.fitness,
            convergenceHistory,
            particles: this.swarm,
            iterations: this.config.iterations,
        };
    }
    /**
     * Evaluate fitness of all particles in parallel using agentic-flow
     */
    async evaluateSwarm(productId, currentFeatures) {
        // Create agents for parallel evaluation
        const agents = this.swarm.map((particle) => ({
            id: particle.id,
            role: 'policy-evaluator',
            task: `Evaluate policy: ${JSON.stringify(particle.position)}`,
            execute: async () => {
                return this.evaluateParticle(particle, productId, currentFeatures);
            },
        }));
        // Execute in parallel
        await this.agenticFlow.executeParallel(agents);
    }
    /**
     * Evaluate fitness of single particle
     */
    async evaluateParticle(particle, productId, currentFeatures) {
        // Create temporary optimizer config with particle's parameters
        const tempConfig = {
            targetServiceLevel: 0.95,
            planningHorizon: 30,
            reviewPeriod: 7,
            safetyFactor: particle.position.safetyFactor,
            costWeights: {
                holding: 1,
                ordering: 1,
                shortage: 1,
            },
        };
        // Create temporary optimizer
        const tempOptimizer = new inventory_optimizer_1.InventoryOptimizer(this.forecaster, tempConfig);
        // Copy network from main optimizer
        const topology = this.optimizer.getNetworkTopology();
        for (const node of topology.nodes) {
            tempOptimizer.addNode(node);
        }
        // Simulate with particle's policy
        const simulation = await tempOptimizer.simulate(productId, currentFeatures, 30);
        // Calculate fitness
        const costFitness = simulation.avgInventoryCost;
        const serviceLevelFitness = 1 - simulation.avgServiceLevel; // Minimize (1 - service level)
        // Combined fitness (weighted sum)
        const combinedFitness = this.config.objectives.costWeight * costFitness +
            this.config.objectives.serviceLevelWeight * serviceLevelFitness;
        // Update particle fitness
        particle.fitness = {
            cost: costFitness,
            serviceLevel: simulation.avgServiceLevel,
            combined: combinedFitness,
        };
    }
    /**
     * Update personal and global bests
     */
    updateBests() {
        for (const particle of this.swarm) {
            // Update personal best
            if (particle.fitness.combined < particle.personalBest.fitness.combined) {
                particle.personalBest = {
                    position: { ...particle.position },
                    fitness: { ...particle.fitness },
                };
            }
            // Update global best
            if (!this.globalBest || particle.fitness.combined < this.globalBest.fitness.combined) {
                this.globalBest = {
                    ...particle,
                    position: { ...particle.position },
                    fitness: { ...particle.fitness },
                };
            }
        }
    }
    /**
     * Update velocities and positions using PSO update rules
     */
    updateSwarm() {
        for (const particle of this.swarm) {
            // Update velocity for each dimension
            for (const dim of ['reorderPoint', 'orderUpToLevel', 'safetyFactor']) {
                const r1 = Math.random();
                const r2 = Math.random();
                // PSO velocity update: v = w*v + c1*r1*(pbest - x) + c2*r2*(gbest - x)
                particle.velocity[dim] =
                    this.config.inertia * particle.velocity[dim] +
                        this.config.cognitive * r1 * (particle.personalBest.position[dim] - particle.position[dim]) +
                        this.config.social * r2 * (this.globalBest.position[dim] - particle.position[dim]);
                // Update position
                particle.position[dim] += particle.velocity[dim];
                // Apply bounds
                const bounds = this.config.bounds[dim];
                particle.position[dim] = Math.max(bounds[0], Math.min(bounds[1], particle.position[dim]));
            }
        }
    }
    /**
     * Random value in range
     */
    randomInRange(range) {
        return range[0] + Math.random() * (range[1] - range[0]);
    }
    /**
     * Get Pareto front for multi-objective optimization
     */
    getParetoFront() {
        const front = [];
        for (const particle of this.swarm) {
            let isDominated = false;
            for (const other of this.swarm) {
                if (particle === other)
                    continue;
                // Check if 'other' dominates 'particle'
                if (other.fitness.cost <= particle.fitness.cost &&
                    other.fitness.serviceLevel >= particle.fitness.serviceLevel &&
                    (other.fitness.cost < particle.fitness.cost ||
                        other.fitness.serviceLevel > particle.fitness.serviceLevel)) {
                    isDominated = true;
                    break;
                }
            }
            if (!isDominated) {
                front.push(particle);
            }
        }
        return front;
    }
    /**
     * Adaptive learning of service level targets
     */
    async adaptServiceLevel(productId, currentFeatures, targetRevenue) {
        // Binary search for optimal service level
        let low = 0.8;
        let high = 0.99;
        let optimalLevel = 0.95;
        while (high - low > 0.01) {
            const mid = (low + high) / 2;
            // Test service level
            const config = {
                targetServiceLevel: mid,
                planningHorizon: 30,
                reviewPeriod: 7,
                safetyFactor: 1.65,
                costWeights: { holding: 1, ordering: 1, shortage: 1 },
            };
            const tempOptimizer = new inventory_optimizer_1.InventoryOptimizer(this.forecaster, config);
            // Copy network
            const topology = this.optimizer.getNetworkTopology();
            for (const node of topology.nodes) {
                tempOptimizer.addNode(node);
            }
            // Simulate
            const simulation = await tempOptimizer.simulate(productId, currentFeatures, 30);
            // Calculate revenue (simplified)
            const revenue = simulation.fillRate * targetRevenue;
            const profit = revenue - simulation.avgInventoryCost;
            // Adjust search range
            if (profit > targetRevenue * 0.1) {
                // Target 10% margin
                high = mid;
            }
            else {
                low = mid;
            }
            optimalLevel = mid;
        }
        return optimalLevel;
    }
    /**
     * Export best policy for deployment
     */
    exportPolicy() {
        if (!this.globalBest) {
            throw new Error('No policy available. Run optimization first.');
        }
        return {
            policy: this.globalBest.position,
            performance: this.globalBest.fitness,
            timestamp: Date.now(),
        };
    }
}
exports.SwarmPolicyOptimizer = SwarmPolicyOptimizer;
//# sourceMappingURL=swarm-policy.js.map