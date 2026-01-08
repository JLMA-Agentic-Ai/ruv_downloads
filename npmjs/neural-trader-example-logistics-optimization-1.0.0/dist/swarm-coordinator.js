"use strict";
/**
 * Multi-agent swarm coordinator for parallel route optimization
 * Uses agentic-flow for swarm orchestration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwarmCoordinator = void 0;
const router_1 = require("./router");
const openai_1 = __importDefault(require("openai"));
class SwarmCoordinator {
    config;
    agents;
    router;
    messageQueue;
    globalBestSolution;
    openai;
    iterationCount;
    constructor(config, customers, vehicles, openRouterApiKey) {
        this.config = config;
        this.agents = new Map();
        this.router = new router_1.VRPRouter(customers, vehicles);
        this.messageQueue = [];
        this.globalBestSolution = null;
        this.iterationCount = 0;
        // Initialize OpenRouter client for constraint reasoning
        this.openai = new openai_1.default({
            apiKey: openRouterApiKey || process.env.OPENROUTER_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1'
        });
        this.initializeAgents();
    }
    /**
     * Initialize swarm agents with different algorithms
     */
    initializeAgents() {
        const algorithms = [
            'genetic',
            'simulated-annealing',
            'ant-colony'
        ];
        for (let i = 0; i < this.config.numAgents; i++) {
            const algorithm = algorithms[i % algorithms.length];
            const agent = {
                id: `agent-${i}`,
                algorithm,
                bestSolution: null,
                iterations: 0,
                status: 'idle'
            };
            this.agents.set(agent.id, agent);
        }
    }
    /**
     * Run swarm optimization in parallel
     */
    async optimize() {
        console.log(`Starting swarm optimization with ${this.agents.size} agents...`);
        const optimizationPromises = [];
        // Launch all agents in parallel
        for (const [agentId, agent] of this.agents.entries()) {
            optimizationPromises.push(this.runAgent(agentId, agent));
        }
        // Wait for all agents to complete or convergence
        await Promise.race([
            Promise.all(optimizationPromises),
            this.waitForConvergence()
        ]);
        console.log(`Swarm optimization completed after ${this.iterationCount} iterations`);
        return this.globalBestSolution || this.createEmptySolution();
    }
    /**
     * Run individual agent optimization
     */
    async runAgent(agentId, agent) {
        agent.status = 'working';
        const config = {
            algorithm: agent.algorithm,
            maxIterations: Math.floor(this.config.convergenceCriteria.maxIterations / this.config.numAgents),
            populationSize: 30,
            mutationRate: 0.1,
            crossoverRate: 0.8,
            temperature: 1000,
            coolingRate: 0.995,
            pheromoneEvaporation: 0.1
        };
        while (agent.iterations < config.maxIterations && !this.hasConverged()) {
            let solution;
            switch (agent.algorithm) {
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
            solution.metadata.agentId = agentId;
            agent.bestSolution = solution;
            agent.iterations++;
            this.iterationCount++;
            // Update global best
            if (!this.globalBestSolution || solution.fitness < this.globalBestSolution.fitness) {
                this.globalBestSolution = solution;
                console.log(`Agent ${agentId} found new best solution: fitness=${solution.fitness.toFixed(2)}`);
                // Broadcast to other agents
                if (this.config.communicationStrategy === 'broadcast') {
                    this.broadcastSolution(agentId, solution);
                }
            }
            // Handle communication
            await this.processCommunication();
            // Small delay to prevent CPU thrashing
            await this.sleep(10);
        }
        agent.status = 'completed';
    }
    /**
     * Process inter-agent communication
     */
    async processCommunication() {
        if (this.config.communicationStrategy === 'best-solution') {
            // Share global best with all agents periodically
            if (this.iterationCount % 10 === 0 && this.globalBestSolution) {
                for (const [agentId, agent] of this.agents.entries()) {
                    if (agent.bestSolution &&
                        this.globalBestSolution.fitness < agent.bestSolution.fitness) {
                        // Agent learns from global best
                        agent.bestSolution = { ...this.globalBestSolution };
                    }
                }
            }
        }
        else if (this.config.communicationStrategy === 'diversity') {
            // Maintain diversity by sharing different solutions
            if (this.iterationCount % 20 === 0) {
                await this.maintainDiversity();
            }
        }
    }
    /**
     * Broadcast solution to all agents
     */
    broadcastSolution(fromAgentId, solution) {
        const message = {
            from: fromAgentId,
            to: 'broadcast',
            type: 'solution-share',
            payload: solution,
            timestamp: Date.now()
        };
        this.messageQueue.push(message);
    }
    /**
     * Maintain solution diversity across agents
     */
    async maintainDiversity() {
        const solutions = Array.from(this.agents.values())
            .filter(a => a.bestSolution)
            .map(a => a.bestSolution);
        if (solutions.length < 2)
            return;
        // Calculate diversity metric (simplified)
        const diversityScore = this.calculateDiversityScore(solutions);
        if (diversityScore < 0.3) {
            // Low diversity - inject randomness into some agents
            let resetCount = 0;
            for (const [agentId, agent] of this.agents.entries()) {
                if (resetCount >= this.config.numAgents / 3)
                    break;
                if (agent.bestSolution &&
                    agent.bestSolution.fitness > this.globalBestSolution.fitness * 1.2) {
                    console.log(`Resetting agent ${agentId} to maintain diversity`);
                    agent.bestSolution = null;
                    resetCount++;
                }
            }
        }
    }
    /**
     * Calculate diversity score for solutions
     */
    calculateDiversityScore(solutions) {
        if (solutions.length < 2)
            return 1.0;
        let totalDifference = 0;
        let comparisons = 0;
        for (let i = 0; i < solutions.length; i++) {
            for (let j = i + 1; j < solutions.length; j++) {
                const diff = Math.abs(solutions[i].fitness - solutions[j].fitness);
                totalDifference += diff;
                comparisons++;
            }
        }
        const avgDifference = totalDifference / comparisons;
        const avgFitness = solutions.reduce((sum, s) => sum + s.fitness, 0) / solutions.length;
        return avgDifference / (avgFitness + 1);
    }
    /**
     * Check if swarm has converged
     */
    hasConverged() {
        if (this.iterationCount >= this.config.convergenceCriteria.maxIterations) {
            return true;
        }
        if (this.config.convergenceCriteria.fitnessThreshold &&
            this.globalBestSolution &&
            this.globalBestSolution.fitness <= this.config.convergenceCriteria.fitnessThreshold) {
            return true;
        }
        // Check for no improvement
        if (this.config.convergenceCriteria.noImprovementSteps) {
            // Implementation would track improvement history
            // Simplified for now
        }
        return false;
    }
    /**
     * Wait for convergence criteria
     */
    async waitForConvergence() {
        while (!this.hasConverged()) {
            await this.sleep(100);
        }
    }
    /**
     * Use OpenRouter LLM for constraint reasoning
     */
    async reasonAboutConstraints(solution) {
        try {
            const prompt = `Analyze this vehicle routing solution and identify constraint violations or optimization opportunities:

Total Routes: ${solution.routes.length}
Total Cost: $${solution.totalCost.toFixed(2)}
Total Distance: ${solution.totalDistance.toFixed(2)} km
Unassigned Customers: ${solution.unassignedCustomers.length}

Routes:
${solution.routes.map((r, i) => `
Route ${i + 1} (Vehicle ${r.vehicleId}):
- Customers: ${r.customers.length}
- Distance: ${r.totalDistance.toFixed(2)} km
- Time Window Violations: ${r.timeWindowViolations}
- Capacity Violations: ${r.capacityViolations}
`).join('\n')}

Provide specific recommendations for improvement.`;
            const response = await this.openai.chat.completions.create({
                model: 'openai/gpt-4-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a logistics optimization expert analyzing vehicle routing solutions.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });
            return response.choices[0]?.message?.content || 'No recommendations available.';
        }
        catch (error) {
            console.error('Error calling OpenRouter:', error);
            return 'Unable to generate recommendations at this time.';
        }
    }
    /**
     * Get swarm status and metrics
     */
    getStatus() {
        const agentsWorking = Array.from(this.agents.values()).filter(a => a.status === 'working').length;
        const agentsCompleted = Array.from(this.agents.values()).filter(a => a.status === 'completed').length;
        return {
            iteration: this.iterationCount,
            agentsWorking,
            agentsCompleted,
            globalBestFitness: this.globalBestSolution?.fitness || null,
            convergence: this.iterationCount / this.config.convergenceCriteria.maxIterations
        };
    }
    /**
     * Get agent details
     */
    getAgents() {
        return Array.from(this.agents.values());
    }
    createEmptySolution() {
        return {
            routes: [],
            totalCost: 0,
            totalDistance: 0,
            unassignedCustomers: [],
            fitness: Infinity,
            metadata: { algorithm: 'none', iterations: 0, computeTime: 0 }
        };
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.SwarmCoordinator = SwarmCoordinator;
//# sourceMappingURL=swarm-coordinator.js.map