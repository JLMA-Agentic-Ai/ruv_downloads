/**
 * Portfolio Optimization Engine
 * Implements multiple optimization algorithms: Mean-Variance, Risk Parity, Black-Litterman
 */
export interface Asset {
    symbol: string;
    expectedReturn: number;
    volatility: number;
}
export interface PortfolioConstraints {
    minWeight?: number;
    maxWeight?: number;
    targetReturn?: number;
    maxRisk?: number;
    shortSelling?: boolean;
}
export interface OptimizationResult {
    weights: number[];
    expectedReturn: number;
    risk: number;
    sharpeRatio: number;
    algorithm: string;
    diversificationRatio: number;
}
export interface EfficientFrontierPoint {
    return: number;
    risk: number;
    weights: number[];
    sharpeRatio: number;
}
/**
 * Mean-Variance Optimization (Markowitz)
 * Maximizes return for given risk or minimizes risk for given return
 */
export declare class MeanVarianceOptimizer {
    private assets;
    private correlationMatrix;
    constructor(assets: Asset[], correlationMatrix: number[][]);
    /**
     * Calculate portfolio risk (standard deviation)
     */
    private calculateRisk;
    /**
     * Calculate portfolio expected return
     */
    private calculateReturn;
    /**
     * Build covariance matrix from correlations and volatilities
     */
    private buildCovarianceMatrix;
    /**
     * Calculate Sharpe ratio (assuming risk-free rate = 0)
     */
    private calculateSharpeRatio;
    /**
     * Optimize portfolio using quadratic programming
     * Simplified gradient descent approach
     */
    optimize(constraints?: PortfolioConstraints): OptimizationResult;
    /**
     * Compute gradient for optimization
     */
    private computeGradient;
    /**
     * Objective function: minimize risk, maximize return
     */
    private objectiveFunction;
    /**
     * Project weights onto constraints
     */
    private projectConstraints;
    /**
     * Calculate diversification ratio
     */
    private calculateDiversification;
    /**
     * Generate efficient frontier
     */
    generateEfficientFrontier(points?: number): EfficientFrontierPoint[];
}
/**
 * Risk Parity Optimization
 * Equalizes risk contribution across assets
 */
export declare class RiskParityOptimizer {
    private assets;
    private correlationMatrix;
    constructor(assets: Asset[], correlationMatrix: number[][]);
    /**
     * Calculate risk contribution of each asset
     */
    private calculateRiskContribution;
    private buildCovarianceMatrix;
    private calculateVariance;
    /**
     * Optimize for equal risk contribution
     */
    optimize(constraints?: PortfolioConstraints): OptimizationResult;
    private calculateDiversification;
}
/**
 * Black-Litterman Model
 * Combines market equilibrium with investor views
 */
export declare class BlackLittermanOptimizer {
    private assets;
    private correlationMatrix;
    private marketCapWeights;
    private riskAversion;
    constructor(assets: Asset[], correlationMatrix: number[][], marketCapWeights: number[], riskAversion?: number);
    /**
     * Calculate implied equilibrium returns
     */
    private calculateEquilibriumReturns;
    private buildCovarianceMatrix;
    /**
     * Blend equilibrium returns with investor views
     */
    optimize(views: {
        assets: number[];
        expectedReturn: number;
        confidence: number;
    }[], constraints?: PortfolioConstraints): OptimizationResult;
    /**
     * Blend equilibrium returns with views using Bayesian updating
     */
    private blendViews;
}
/**
 * Multi-Objective Portfolio Optimizer
 * Optimizes for return, risk, and drawdown simultaneously
 */
export declare class MultiObjectiveOptimizer {
    private assets;
    private correlationMatrix;
    private historicalReturns;
    constructor(assets: Asset[], correlationMatrix: number[][], historicalReturns: number[][]);
    /**
     * Calculate maximum drawdown
     */
    private calculateMaxDrawdown;
    private calculatePortfolioReturns;
    /**
     * Pareto-optimal multi-objective optimization
     */
    optimize(objectives: {
        return: number;
        risk: number;
        drawdown: number;
    }, constraints?: PortfolioConstraints): OptimizationResult;
    private computeMultiObjectiveGradient;
    private multiObjectiveFunction;
    private calculateRisk;
    private buildCovarianceMatrix;
    private calculateDiversification;
}
//# sourceMappingURL=optimizer.d.ts.map