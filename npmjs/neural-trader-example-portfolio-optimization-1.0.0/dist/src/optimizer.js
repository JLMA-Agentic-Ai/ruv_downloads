/**
 * Portfolio Optimization Engine
 * Implements multiple optimization algorithms: Mean-Variance, Risk Parity, Black-Litterman
 */
import { create, all } from 'mathjs';
const math = create(all);
/**
 * Mean-Variance Optimization (Markowitz)
 * Maximizes return for given risk or minimizes risk for given return
 */
export class MeanVarianceOptimizer {
    assets;
    correlationMatrix;
    constructor(assets, correlationMatrix) {
        this.assets = assets;
        this.correlationMatrix = correlationMatrix;
    }
    /**
     * Calculate portfolio risk (standard deviation)
     */
    calculateRisk(weights) {
        const covarianceMatrix = this.buildCovarianceMatrix();
        let variance = 0;
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                variance += weights[i] * weights[j] * covarianceMatrix[i][j];
            }
        }
        return Math.sqrt(variance);
    }
    /**
     * Calculate portfolio expected return
     */
    calculateReturn(weights) {
        return weights.reduce((sum, w, i) => sum + w * this.assets[i].expectedReturn, 0);
    }
    /**
     * Build covariance matrix from correlations and volatilities
     */
    buildCovarianceMatrix() {
        const n = this.assets.length;
        const covariance = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                covariance[i][j] =
                    this.correlationMatrix[i][j] *
                        this.assets[i].volatility *
                        this.assets[j].volatility;
            }
        }
        return covariance;
    }
    /**
     * Calculate Sharpe ratio (assuming risk-free rate = 0)
     */
    calculateSharpeRatio(weights) {
        const ret = this.calculateReturn(weights);
        const risk = this.calculateRisk(weights);
        return risk > 0 ? ret / risk : 0;
    }
    /**
     * Optimize portfolio using quadratic programming
     * Simplified gradient descent approach
     */
    optimize(constraints = {}) {
        const n = this.assets.length;
        let weights = Array(n).fill(1 / n); // Equal weight initialization
        // Gradient descent optimization
        const learningRate = 0.01;
        const iterations = 1000;
        const tolerance = 1e-6;
        for (let iter = 0; iter < iterations; iter++) {
            const gradient = this.computeGradient(weights, constraints);
            const newWeights = weights.map((w, i) => w - learningRate * gradient[i]);
            // Project onto constraints
            const projectedWeights = this.projectConstraints(newWeights, constraints);
            // Check convergence
            const change = projectedWeights.reduce((sum, w, i) => sum + Math.abs(w - weights[i]), 0);
            if (change < tolerance)
                break;
            weights = projectedWeights;
        }
        return {
            weights,
            expectedReturn: this.calculateReturn(weights),
            risk: this.calculateRisk(weights),
            sharpeRatio: this.calculateSharpeRatio(weights),
            algorithm: 'mean-variance',
            diversificationRatio: this.calculateDiversification(weights),
        };
    }
    /**
     * Compute gradient for optimization
     */
    computeGradient(weights, constraints) {
        const epsilon = 1e-5;
        const n = weights.length;
        const gradient = Array(n).fill(0);
        const currentObjective = this.objectiveFunction(weights, constraints);
        for (let i = 0; i < n; i++) {
            const perturbedWeights = [...weights];
            perturbedWeights[i] += epsilon;
            const perturbedObjective = this.objectiveFunction(perturbedWeights, constraints);
            gradient[i] = (perturbedObjective - currentObjective) / epsilon;
        }
        return gradient;
    }
    /**
     * Objective function: minimize risk, maximize return
     */
    objectiveFunction(weights, constraints) {
        const risk = this.calculateRisk(weights);
        const ret = this.calculateReturn(weights);
        // Multi-objective: maximize Sharpe ratio
        const sharpe = ret / (risk + 1e-10);
        return -sharpe; // Minimize negative Sharpe
    }
    /**
     * Project weights onto constraints
     */
    projectConstraints(weights, constraints) {
        let projected = [...weights];
        // Apply weight bounds
        const minWeight = constraints.minWeight ?? (constraints.shortSelling ? -1 : 0);
        const maxWeight = constraints.maxWeight ?? 1;
        projected = projected.map(w => Math.max(minWeight, Math.min(maxWeight, w)));
        // Normalize to sum to 1
        const sum = projected.reduce((a, b) => a + b, 0);
        if (sum > 0) {
            projected = projected.map(w => w / sum);
        }
        return projected;
    }
    /**
     * Calculate diversification ratio
     */
    calculateDiversification(weights) {
        const weightedAvgVol = weights.reduce((sum, w, i) => sum + w * this.assets[i].volatility, 0);
        const portfolioVol = this.calculateRisk(weights);
        return portfolioVol > 0 ? weightedAvgVol / portfolioVol : 1;
    }
    /**
     * Generate efficient frontier
     */
    generateEfficientFrontier(points = 50) {
        const frontier = [];
        const minReturn = Math.min(...this.assets.map(a => a.expectedReturn));
        const maxReturn = Math.max(...this.assets.map(a => a.expectedReturn));
        for (let i = 0; i < points; i++) {
            const targetReturn = minReturn + (maxReturn - minReturn) * (i / (points - 1));
            const result = this.optimize({ targetReturn });
            frontier.push({
                return: result.expectedReturn,
                risk: result.risk,
                weights: result.weights,
                sharpeRatio: result.sharpeRatio,
            });
        }
        return frontier;
    }
}
/**
 * Risk Parity Optimization
 * Equalizes risk contribution across assets
 */
export class RiskParityOptimizer {
    assets;
    correlationMatrix;
    constructor(assets, correlationMatrix) {
        this.assets = assets;
        this.correlationMatrix = correlationMatrix;
    }
    /**
     * Calculate risk contribution of each asset
     */
    calculateRiskContribution(weights) {
        const covarianceMatrix = this.buildCovarianceMatrix();
        const n = weights.length;
        const portfolioVar = this.calculateVariance(weights);
        const riskContribution = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            let contribution = 0;
            for (let j = 0; j < n; j++) {
                contribution += weights[j] * covarianceMatrix[i][j];
            }
            riskContribution[i] = weights[i] * contribution / Math.sqrt(portfolioVar);
        }
        return riskContribution;
    }
    buildCovarianceMatrix() {
        const n = this.assets.length;
        const covariance = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                covariance[i][j] =
                    this.correlationMatrix[i][j] *
                        this.assets[i].volatility *
                        this.assets[j].volatility;
            }
        }
        return covariance;
    }
    calculateVariance(weights) {
        const covarianceMatrix = this.buildCovarianceMatrix();
        let variance = 0;
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                variance += weights[i] * weights[j] * covarianceMatrix[i][j];
            }
        }
        return variance;
    }
    /**
     * Optimize for equal risk contribution
     */
    optimize(constraints = {}) {
        const n = this.assets.length;
        let weights = Array(n).fill(1 / n);
        const learningRate = 0.01;
        const iterations = 2000;
        const tolerance = 1e-6;
        for (let iter = 0; iter < iterations; iter++) {
            const riskContrib = this.calculateRiskContribution(weights);
            const avgRisk = riskContrib.reduce((a, b) => a + b, 0) / n;
            // Gradient: move towards equal risk contribution
            const gradient = riskContrib.map(rc => rc - avgRisk);
            const newWeights = weights.map((w, i) => w - learningRate * gradient[i]);
            // Normalize
            const sum = newWeights.reduce((a, b) => a + Math.abs(b), 0);
            const normalizedWeights = newWeights.map(w => w / sum);
            // Check convergence
            const change = normalizedWeights.reduce((sum, w, i) => sum + Math.abs(w - weights[i]), 0);
            if (change < tolerance)
                break;
            weights = normalizedWeights;
        }
        const expectedReturn = weights.reduce((sum, w, i) => sum + w * this.assets[i].expectedReturn, 0);
        const risk = Math.sqrt(this.calculateVariance(weights));
        return {
            weights,
            expectedReturn,
            risk,
            sharpeRatio: risk > 0 ? expectedReturn / risk : 0,
            algorithm: 'risk-parity',
            diversificationRatio: this.calculateDiversification(weights),
        };
    }
    calculateDiversification(weights) {
        const weightedAvgVol = weights.reduce((sum, w, i) => sum + w * this.assets[i].volatility, 0);
        const portfolioVol = Math.sqrt(this.calculateVariance(weights));
        return portfolioVol > 0 ? weightedAvgVol / portfolioVol : 1;
    }
}
/**
 * Black-Litterman Model
 * Combines market equilibrium with investor views
 */
export class BlackLittermanOptimizer {
    assets;
    correlationMatrix;
    marketCapWeights;
    riskAversion;
    constructor(assets, correlationMatrix, marketCapWeights, riskAversion = 2.5) {
        this.assets = assets;
        this.correlationMatrix = correlationMatrix;
        this.marketCapWeights = marketCapWeights;
        this.riskAversion = riskAversion;
    }
    /**
     * Calculate implied equilibrium returns
     */
    calculateEquilibriumReturns() {
        const covarianceMatrix = this.buildCovarianceMatrix();
        const n = this.assets.length;
        const equilibriumReturns = Array(n).fill(0);
        // Reverse optimization: Pi = lambda * Sigma * w_mkt
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                equilibriumReturns[i] += this.riskAversion * covarianceMatrix[i][j] * this.marketCapWeights[j];
            }
        }
        return equilibriumReturns;
    }
    buildCovarianceMatrix() {
        const n = this.assets.length;
        const covariance = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                covariance[i][j] =
                    this.correlationMatrix[i][j] *
                        this.assets[i].volatility *
                        this.assets[j].volatility;
            }
        }
        return covariance;
    }
    /**
     * Blend equilibrium returns with investor views
     */
    optimize(views, constraints = {}) {
        const equilibriumReturns = this.calculateEquilibriumReturns();
        const blendedReturns = this.blendViews(equilibriumReturns, views);
        // Use mean-variance optimization with blended returns
        const blendedAssets = this.assets.map((asset, i) => ({
            ...asset,
            expectedReturn: blendedReturns[i],
        }));
        const optimizer = new MeanVarianceOptimizer(blendedAssets, this.correlationMatrix);
        const result = optimizer.optimize(constraints);
        return {
            ...result,
            algorithm: 'black-litterman',
        };
    }
    /**
     * Blend equilibrium returns with views using Bayesian updating
     */
    blendViews(equilibriumReturns, views) {
        // Simplified blending: weighted average
        const blended = [...equilibriumReturns];
        const viewWeights = Array(blended.length).fill(0);
        for (const view of views) {
            for (const assetIdx of view.assets) {
                blended[assetIdx] =
                    (blended[assetIdx] * (1 - view.confidence) + view.expectedReturn * view.confidence);
                viewWeights[assetIdx] += view.confidence;
            }
        }
        return blended;
    }
}
/**
 * Multi-Objective Portfolio Optimizer
 * Optimizes for return, risk, and drawdown simultaneously
 */
export class MultiObjectiveOptimizer {
    assets;
    correlationMatrix;
    historicalReturns;
    constructor(assets, correlationMatrix, historicalReturns) {
        this.assets = assets;
        this.correlationMatrix = correlationMatrix;
        this.historicalReturns = historicalReturns;
    }
    /**
     * Calculate maximum drawdown
     */
    calculateMaxDrawdown(weights) {
        const portfolioReturns = this.calculatePortfolioReturns(weights);
        let maxDrawdown = 0;
        let peak = portfolioReturns[0];
        for (const value of portfolioReturns) {
            if (value > peak)
                peak = value;
            const drawdown = (peak - value) / peak;
            if (drawdown > maxDrawdown)
                maxDrawdown = drawdown;
        }
        return maxDrawdown;
    }
    calculatePortfolioReturns(weights) {
        return this.historicalReturns.map(returns => returns.reduce((sum, ret, i) => sum + ret * weights[i], 0));
    }
    /**
     * Pareto-optimal multi-objective optimization
     */
    optimize(objectives, constraints = {}) {
        const n = this.assets.length;
        let weights = Array(n).fill(1 / n);
        const learningRate = 0.01;
        const iterations = 1500;
        for (let iter = 0; iter < iterations; iter++) {
            const gradient = this.computeMultiObjectiveGradient(weights, objectives);
            const newWeights = weights.map((w, i) => w - learningRate * gradient[i]);
            // Normalize
            const sum = newWeights.reduce((a, b) => a + Math.abs(b), 0);
            weights = newWeights.map(w => w / sum);
        }
        const expectedReturn = weights.reduce((sum, w, i) => sum + w * this.assets[i].expectedReturn, 0);
        const risk = this.calculateRisk(weights);
        return {
            weights,
            expectedReturn,
            risk,
            sharpeRatio: risk > 0 ? expectedReturn / risk : 0,
            algorithm: 'multi-objective',
            diversificationRatio: this.calculateDiversification(weights),
        };
    }
    computeMultiObjectiveGradient(weights, objectives) {
        const epsilon = 1e-5;
        const n = weights.length;
        const gradient = Array(n).fill(0);
        const currentObjective = this.multiObjectiveFunction(weights, objectives);
        for (let i = 0; i < n; i++) {
            const perturbedWeights = [...weights];
            perturbedWeights[i] += epsilon;
            const perturbedObjective = this.multiObjectiveFunction(perturbedWeights, objectives);
            gradient[i] = (perturbedObjective - currentObjective) / epsilon;
        }
        return gradient;
    }
    multiObjectiveFunction(weights, objectives) {
        const ret = weights.reduce((sum, w, i) => sum + w * this.assets[i].expectedReturn, 0);
        const risk = this.calculateRisk(weights);
        const drawdown = this.calculateMaxDrawdown(weights);
        return (-objectives.return * ret +
            objectives.risk * risk +
            objectives.drawdown * drawdown);
    }
    calculateRisk(weights) {
        const covarianceMatrix = this.buildCovarianceMatrix();
        let variance = 0;
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                variance += weights[i] * weights[j] * covarianceMatrix[i][j];
            }
        }
        return Math.sqrt(variance);
    }
    buildCovarianceMatrix() {
        const n = this.assets.length;
        const covariance = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                covariance[i][j] =
                    this.correlationMatrix[i][j] *
                        this.assets[i].volatility *
                        this.assets[j].volatility;
            }
        }
        return covariance;
    }
    calculateDiversification(weights) {
        const weightedAvgVol = weights.reduce((sum, w, i) => sum + w * this.assets[i].volatility, 0);
        const portfolioVol = this.calculateRisk(weights);
        return portfolioVol > 0 ? weightedAvgVol / portfolioVol : 1;
    }
}
//# sourceMappingURL=optimizer.js.map