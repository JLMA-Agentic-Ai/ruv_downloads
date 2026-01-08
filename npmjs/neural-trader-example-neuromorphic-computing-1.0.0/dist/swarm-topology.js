"use strict";
/**
 * Swarm-based topology exploration for optimal network connectivity
 *
 * Uses particle swarm optimization to discover efficient network topologies
 * that maximize performance on specific tasks while minimizing connections.
 *
 * Integrates with OpenRouter for architecture optimization guidance.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwarmTopologyOptimizer = void 0;
exports.patternRecognitionFitness = patternRecognitionFitness;
exports.temporalSequenceFitness = temporalSequenceFitness;
exports.getOpenRouterArchitectureSuggestion = getOpenRouterArchitectureSuggestion;
const snn_1 = require("./snn");
const stdp_1 = require("./stdp");
/**
 * Swarm-based topology optimizer for neuromorphic networks
 */
class SwarmTopologyOptimizer {
    params;
    particles;
    global_best_fitness;
    global_best_topology;
    network_size;
    constructor(network_size, params = {}) {
        this.network_size = network_size;
        this.params = {
            swarm_size: params.swarm_size ?? 20,
            max_connections: params.max_connections ?? network_size * 5,
            inertia: params.inertia ?? 0.7,
            c1: params.c1 ?? 1.5, // Cognitive coefficient
            c2: params.c2 ?? 1.5, // Social coefficient
            max_iterations: params.max_iterations ?? 50,
        };
        this.particles = [];
        this.global_best_fitness = -Infinity;
        this.global_best_topology = [];
        this.initializeSwarm();
    }
    /**
     * Initialize swarm with random topologies
     */
    initializeSwarm() {
        for (let i = 0; i < this.params.swarm_size; i++) {
            const topology = this.generateRandomTopology();
            const particle = {
                id: `particle_${i}`,
                topology,
                velocity: topology.map(() => ({
                    weight: (Math.random() - 0.5) * 0.2,
                    delay: (Math.random() - 0.5) * 0.5,
                })),
                fitness: -Infinity,
                best_fitness: -Infinity,
                best_topology: [...topology],
            };
            this.particles.push(particle);
        }
    }
    /**
     * Generate random network topology
     */
    generateRandomTopology() {
        const num_connections = Math.floor(Math.random() * this.params.max_connections + 10);
        const topology = [];
        for (let i = 0; i < num_connections; i++) {
            let source = Math.floor(Math.random() * this.network_size);
            let target = Math.floor(Math.random() * this.network_size);
            // Avoid self-connections
            while (source === target) {
                target = Math.floor(Math.random() * this.network_size);
            }
            topology.push({
                source,
                target,
                weight: (Math.random() * 2 - 1) * 2,
                delay: Math.random() * 5 + 1, // 1-6ms delay
            });
        }
        return topology;
    }
    /**
     * Apply topology to a spiking neural network
     */
    applyTopology(network, topology) {
        topology.forEach((gene) => {
            try {
                network.addConnection(gene.source, gene.target, gene.weight, gene.delay);
            }
            catch (error) {
                // Skip invalid connections
            }
        });
    }
    /**
     * Evaluate fitness of a topology on a task
     */
    evaluateFitness(topology, task) {
        // Create network with this topology
        const network = new snn_1.SpikingNeuralNetwork(this.network_size);
        this.applyTopology(network, topology);
        // Evaluate on task
        const performance = task.evaluate(network, task.inputs, task.targets);
        // Penalize excessive connections (favor sparse networks)
        const connection_penalty = topology.length / this.params.max_connections;
        const fitness = performance - 0.1 * connection_penalty;
        return fitness;
    }
    /**
     * Update particle velocity and position
     */
    updateParticle(particle) {
        const r1 = Math.random();
        const r2 = Math.random();
        // Update velocity and position for each connection
        particle.topology.forEach((gene, idx) => {
            const velocity = particle.velocity[idx];
            const best_gene = particle.best_topology[idx];
            const global_gene = this.global_best_topology[idx];
            // Update velocity: v = w*v + c1*r1*(pbest - x) + c2*r2*(gbest - x)
            if (best_gene && global_gene) {
                velocity.weight =
                    this.params.inertia * velocity.weight +
                        this.params.c1 * r1 * (best_gene.weight - gene.weight) +
                        this.params.c2 * r2 * (global_gene.weight - gene.weight);
                velocity.delay =
                    this.params.inertia * velocity.delay +
                        this.params.c1 * r1 * (best_gene.delay - gene.delay) +
                        this.params.c2 * r2 * (global_gene.delay - gene.delay);
                // Update position
                gene.weight += velocity.weight;
                gene.delay += velocity.delay;
                // Clamp values
                gene.weight = Math.max(-2, Math.min(2, gene.weight));
                gene.delay = Math.max(1, Math.min(10, gene.delay));
            }
        });
    }
    /**
     * Optimize topology using particle swarm optimization
     * @param task Fitness evaluation task
     * @returns Optimization history
     */
    optimize(task) {
        const history = [];
        for (let iter = 0; iter < this.params.max_iterations; iter++) {
            // Evaluate all particles
            this.particles.forEach((particle) => {
                particle.fitness = this.evaluateFitness(particle.topology, task);
                // Update personal best
                if (particle.fitness > particle.best_fitness) {
                    particle.best_fitness = particle.fitness;
                    particle.best_topology = [...particle.topology];
                }
                // Update global best
                if (particle.fitness > this.global_best_fitness) {
                    this.global_best_fitness = particle.fitness;
                    this.global_best_topology = [...particle.topology];
                }
            });
            // Update all particles
            this.particles.forEach((particle) => this.updateParticle(particle));
            // Record statistics
            const avg_fitness = this.particles.reduce((sum, p) => sum + p.fitness, 0) / this.particles.length;
            history.push({
                iteration: iter,
                best_fitness: this.global_best_fitness,
                avg_fitness,
                best_connections: this.global_best_topology.length,
            });
            // Early stopping if converged
            if (iter > 10 && history[iter].best_fitness === history[iter - 10].best_fitness) {
                console.log(`Converged at iteration ${iter}`);
                break;
            }
        }
        return history;
    }
    /**
     * Get best topology found
     */
    getBestTopology() {
        return [...this.global_best_topology];
    }
    /**
     * Get best fitness achieved
     */
    getBestFitness() {
        return this.global_best_fitness;
    }
    /**
     * Export best topology to JSON
     */
    exportTopology() {
        return JSON.stringify({
            network_size: this.network_size,
            connections: this.global_best_topology.length,
            fitness: this.global_best_fitness,
            topology: this.global_best_topology,
        }, null, 2);
    }
    /**
     * Create network from best topology
     */
    createOptimizedNetwork() {
        const network = new snn_1.SpikingNeuralNetwork(this.network_size);
        this.applyTopology(network, this.global_best_topology);
        return network;
    }
}
exports.SwarmTopologyOptimizer = SwarmTopologyOptimizer;
/**
 * Example fitness function: Pattern recognition task
 */
function patternRecognitionFitness(network, inputs, targets) {
    let correct = 0;
    const duration = 50; // ms
    inputs.forEach((pattern, idx) => {
        network.reset();
        network.injectPattern(pattern);
        const spikes = network.simulate(duration);
        // Count spikes per neuron
        const spike_counts = new Array(network.size()).fill(0);
        spikes.forEach((spike) => {
            spike_counts[spike.neuronId]++;
        });
        // Simple classification: most active neuron
        const predicted_class = spike_counts.indexOf(Math.max(...spike_counts));
        const target_class = targets[idx].indexOf(Math.max(...targets[idx]));
        if (predicted_class === target_class) {
            correct++;
        }
    });
    return correct / inputs.length;
}
/**
 * Example fitness function: Temporal sequence learning
 */
function temporalSequenceFitness(network, inputs, targets) {
    const learner = new stdp_1.STDPLearner();
    let total_error = 0;
    inputs.forEach((pattern, idx) => {
        const result = learner.train(network, pattern, 100);
        const target = targets[idx];
        // Measure spike timing accuracy
        const spike_pattern = new Array(network.size()).fill(0);
        result.spikes.forEach((spike) => {
            spike_pattern[spike.neuronId] = 1;
        });
        // Calculate error
        const error = spike_pattern.reduce((sum, val, i) => sum + Math.abs(val - (target[i] || 0)), 0);
        total_error += error;
    });
    return -total_error / inputs.length; // Negative because we minimize error
}
/**
 * OpenRouter integration for architecture suggestions
 * This would use OpenRouter API to get optimization suggestions
 */
async function getOpenRouterArchitectureSuggestion(task_description, current_topology, performance) {
    // Placeholder for OpenRouter integration
    // In production, this would call OpenRouter API
    const prompt = `
Task: ${task_description}
Current Network: ${current_topology.length} connections
Performance: ${performance.toFixed(3)}

Suggest architecture improvements for this neuromorphic network.
Consider:
- Optimal connectivity patterns
- Synaptic weight distributions
- Network sparsity
- Temporal dynamics
  `;
    // Mock response - replace with actual OpenRouter API call
    return `Suggested improvements:
1. Increase recurrent connections for temporal memory
2. Use sparse connectivity (10-20% connection density)
3. Implement winner-take-all inhibition circuits
4. Add modular structure with specialized subnetworks
5. Balance excitatory/inhibitory connections (80/20 ratio)`;
}
//# sourceMappingURL=swarm-topology.js.map