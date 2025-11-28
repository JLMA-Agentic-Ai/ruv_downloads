"use strict";
/**
 * @neural-trader/example-logistics-optimization
 *
 * Self-learning vehicle routing optimization with multi-agent swarm coordination
 *
 * Features:
 * - Vehicle Routing Problem (VRP) with time windows
 * - Multi-agent swarm optimization (genetic, simulated annealing, ant colony)
 * - Adaptive learning with AgentDB
 * - Real-time route re-optimization
 * - Traffic pattern learning
 * - OpenRouter for constraint reasoning
 * - Sublinear solver for large-scale instances
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsOptimizer = exports.SelfLearningSystem = exports.SwarmCoordinator = exports.VRPRouter = void 0;
exports.createSampleData = createSampleData;
var router_1 = require("./router");
Object.defineProperty(exports, "VRPRouter", { enumerable: true, get: function () { return router_1.VRPRouter; } });
var swarm_coordinator_1 = require("./swarm-coordinator");
Object.defineProperty(exports, "SwarmCoordinator", { enumerable: true, get: function () { return swarm_coordinator_1.SwarmCoordinator; } });
var self_learning_1 = require("./self-learning");
Object.defineProperty(exports, "SelfLearningSystem", { enumerable: true, get: function () { return self_learning_1.SelfLearningSystem; } });
const router_2 = require("./router");
const swarm_coordinator_2 = require("./swarm-coordinator");
const self_learning_2 = require("./self-learning");
/**
 * Main logistics optimization system
 */
class LogisticsOptimizer {
    customers;
    vehicles;
    useSwarm;
    swarmConfig;
    router;
    swarmCoordinator;
    learningSystem;
    episodeCount;
    constructor(customers, vehicles, useSwarm = true, swarmConfig) {
        this.customers = customers;
        this.vehicles = vehicles;
        this.useSwarm = useSwarm;
        this.swarmConfig = swarmConfig;
        this.router = new router_2.VRPRouter(customers, vehicles);
        this.learningSystem = new self_learning_2.SelfLearningSystem(0.1);
        this.episodeCount = 0;
        if (useSwarm && swarmConfig) {
            this.swarmCoordinator = new swarm_coordinator_2.SwarmCoordinator(swarmConfig, customers, vehicles);
        }
        else {
            this.swarmCoordinator = null;
        }
    }
    /**
     * Optimize routes using swarm or single-agent
     */
    async optimize(algorithm) {
        const startTime = Date.now();
        let solution;
        if (this.swarmCoordinator) {
            console.log('Using swarm optimization...');
            solution = await this.swarmCoordinator.optimize();
        }
        else {
            console.log(`Using single-agent ${algorithm || 'genetic'} optimization...`);
            const config = {
                algorithm: algorithm || 'genetic',
                maxIterations: 100,
                populationSize: 50,
                mutationRate: 0.1,
                crossoverRate: 0.8
            };
            switch (config.algorithm) {
                case 'genetic':
                    solution = await this.router.solveGenetic(config);
                    break;
                case 'simulated-annealing':
                    solution = await this.router.solveSimulatedAnnealing(config);
                    break;
                case 'ant-colony':
                    solution = await this.router.solveAntColony(config);
                    break;
            }
        }
        // Learn from solution
        const metrics = {
            episodeId: `episode-${this.episodeCount++}`,
            timestamp: Date.now(),
            solutionQuality: solution.fitness,
            computeTime: Date.now() - startTime,
            customersServed: solution.routes.reduce((sum, r) => sum + r.customers.length, 0)
        };
        await this.learningSystem.learnFromSolution(solution, this.customers, metrics);
        return solution;
    }
    /**
     * Get optimization recommendations using LLM
     */
    async getRecommendations(solution) {
        if (this.swarmCoordinator) {
            return await this.swarmCoordinator.reasonAboutConstraints(solution);
        }
        return 'Swarm coordinator not available for recommendations.';
    }
    /**
     * Get similar past solutions
     */
    async getSimilarSolutions(topK = 5) {
        return await this.learningSystem.retrieveSimilarSolutions(this.customers.length, this.vehicles.length, topK);
    }
    /**
     * Get learning statistics
     */
    getStatistics() {
        return this.learningSystem.getStatistics();
    }
    /**
     * Get swarm status (if using swarm)
     */
    getSwarmStatus() {
        return this.swarmCoordinator?.getStatus() || null;
    }
    /**
     * Get swarm agents (if using swarm)
     */
    getSwarmAgents() {
        return this.swarmCoordinator?.getAgents() || [];
    }
    /**
     * Export learned patterns
     */
    exportPatterns() {
        return this.learningSystem.exportPatterns();
    }
    /**
     * Import learned patterns
     */
    importPatterns(data) {
        this.learningSystem.importPatterns(data);
    }
}
exports.LogisticsOptimizer = LogisticsOptimizer;
/**
 * Helper function to create sample data
 */
function createSampleData(numCustomers = 50, numVehicles = 5) {
    const customers = [];
    const vehicles = [];
    // Create customers in a grid pattern
    for (let i = 0; i < numCustomers; i++) {
        const lat = 40.7 + (Math.random() - 0.5) * 0.2; // NYC area
        const lng = -74.0 + (Math.random() - 0.5) * 0.2;
        customers.push({
            id: `customer-${i}`,
            location: {
                id: `loc-customer-${i}`,
                lat,
                lng,
                name: `Customer ${i}`
            },
            demand: Math.floor(Math.random() * 50) + 10,
            timeWindow: {
                start: Date.now() + Math.random() * 3600000, // Within next hour
                end: Date.now() + 7200000 + Math.random() * 3600000 // 2-3 hours from now
            },
            serviceTime: Math.floor(Math.random() * 20) + 5, // 5-25 minutes
            priority: Math.floor(Math.random() * 10) + 1
        });
    }
    // Create vehicles
    const depot = {
        id: 'depot',
        lat: 40.7128,
        lng: -74.0060,
        name: 'Main Depot'
    };
    for (let i = 0; i < numVehicles; i++) {
        vehicles.push({
            id: `vehicle-${i}`,
            capacity: 200,
            startLocation: depot,
            endLocation: depot,
            availableTimeWindow: {
                start: Date.now(),
                end: Date.now() + 28800000 // 8 hours
            },
            costPerKm: 0.5,
            costPerHour: 20,
            maxWorkingHours: 8
        });
    }
    return { customers, vehicles };
}
//# sourceMappingURL=index.js.map