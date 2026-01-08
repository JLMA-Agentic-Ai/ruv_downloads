"use strict";
/**
 * Forensic Analysis Agent
 * Autonomous agent for fraud detection and analysis
 * Performance target: <100µs vector queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForensicAgent = void 0;
const agent_1 = require("../base/agent");
const agentic_accounting_core_1 = require("@neural-trader/agentic-accounting-core");
const agentic_accounting_core_2 = require("@neural-trader/agentic-accounting-core");
class ForensicAgent extends agent_1.BaseAgent {
    fraudDetection;
    merkleTree;
    forensicConfig;
    constructor(config = {}) {
        super({
            agentId: config.agentId || 'forensic-agent',
            agentType: 'ForensicAgent',
            enableLearning: true,
            enableMetrics: true
        });
        this.fraudDetection = new agentic_accounting_core_1.FraudDetectionService();
        this.merkleTree = new agentic_accounting_core_2.MerkleTreeService();
        this.forensicConfig = {
            sensitivityThreshold: config.sensitivityThreshold ?? 0.7,
            autoInvestigate: config.autoInvestigate ?? true,
            generateProofs: config.generateProofs ?? true
        };
    }
    /**
     * Execute forensic analysis task
     */
    async execute(task) {
        const taskData = task.data;
        this.logger.info(`Executing forensic task: ${taskData.action}`);
        return this.executeWithMetrics(async () => {
            switch (taskData.action) {
                case 'detect_fraud':
                    return await this.detectFraud(taskData.transaction);
                case 'generate_proof':
                    return await this.generateMerkleProof(taskData.transaction, taskData.transactions);
                case 'investigate':
                    return await this.investigate(taskData.transaction);
                case 'analyze_batch':
                    return await this.analyzeBatch(taskData.transactions);
                default:
                    throw new Error(`Unknown action: ${taskData.action}`);
            }
        });
    }
    /**
     * Detect fraud in transaction
     */
    async detectFraud(transaction) {
        this.logger.info(`Detecting fraud for transaction ${transaction.id}`);
        // Run fraud detection
        const fraudScore = await this.fraudDetection.detectFraud(transaction);
        // Auto-investigate if score exceeds threshold
        if (this.forensicConfig.autoInvestigate && fraudScore.score >= this.forensicConfig.sensitivityThreshold) {
            await this.flagForInvestigation(transaction, fraudScore);
        }
        // Log learning data
        await this.learn({
            action: 'detect_fraud',
            transactionId: transaction.id,
            fraudScore: fraudScore.score,
            confidence: fraudScore.confidence,
            patternsMatched: fraudScore.matchedPatterns.length,
            anomalies: fraudScore.anomalies.length
        });
        return fraudScore;
    }
    /**
     * Generate Merkle proof for transaction
     */
    async generateMerkleProof(transaction, allTransactions) {
        this.logger.info(`Generating Merkle proof for transaction ${transaction.id}`);
        const proof = this.merkleTree.generateProof(allTransactions, transaction.id);
        // Log for audit trail
        this.logger.debug('Merkle proof generated', {
            transactionId: transaction.id,
            rootHash: proof.rootHash,
            proofLength: proof.proof.length
        });
        return proof;
    }
    /**
     * Investigate suspicious transaction
     */
    async investigate(transaction) {
        this.logger.info(`Investigating transaction ${transaction.id}`);
        // Run comprehensive analysis
        const fraudScore = await this.fraudDetection.detectFraud(transaction);
        // Build investigation report
        const report = {
            transactionId: transaction.id,
            timestamp: new Date(),
            fraudScore: fraudScore.score,
            confidence: fraudScore.confidence,
            findings: {
                matchedPatterns: fraudScore.matchedPatterns,
                anomalies: fraudScore.anomalies,
                riskLevel: this.calculateRiskLevel(fraudScore.score),
                recommendations: this.generateRecommendations(fraudScore)
            },
            investigatedBy: this.config.agentId,
            investigationDate: new Date()
        };
        // Log investigation
        await this.learn({
            action: 'investigate',
            transactionId: transaction.id,
            riskLevel: report.findings.riskLevel,
            findings: report.findings.anomalies.length
        });
        return report;
    }
    /**
     * Analyze batch of transactions for fraud
     */
    async analyzeBatch(transactions) {
        this.logger.info(`Analyzing batch of ${transactions.length} transactions for fraud`);
        const scores = await this.fraudDetection.detectFraudBatch(transactions);
        // Calculate statistics
        const highRisk = Array.from(scores.values()).filter(s => s.score >= this.forensicConfig.sensitivityThreshold);
        const summary = {
            total: transactions.length,
            highRisk: highRisk.length,
            averageScore: Array.from(scores.values()).reduce((sum, s) => sum + s.score, 0) / scores.size,
            timestamp: new Date()
        };
        // Generate Merkle root for batch
        let merkleRoot = null;
        if (this.forensicConfig.generateProofs) {
            merkleRoot = this.merkleTree.getRootHash(transactions);
        }
        return {
            scores,
            summary,
            merkleRoot
        };
    }
    /**
     * Flag transaction for investigation
     */
    async flagForInvestigation(transaction, fraudScore) {
        this.logger.warn('Transaction flagged for investigation', {
            transactionId: transaction.id,
            fraudScore: fraudScore.score,
            confidence: fraudScore.confidence
        });
        // In production, this would create an investigation case
    }
    /**
     * Calculate risk level from fraud score
     */
    calculateRiskLevel(score) {
        if (score >= 0.9)
            return 'CRITICAL';
        if (score >= 0.7)
            return 'HIGH';
        if (score >= 0.5)
            return 'MEDIUM';
        if (score >= 0.3)
            return 'LOW';
        return 'MINIMAL';
    }
    /**
     * Generate recommendations based on fraud score
     */
    generateRecommendations(fraudScore) {
        const recommendations = [];
        if (fraudScore.score >= 0.9) {
            recommendations.push('Immediate investigation required');
            recommendations.push('Consider blocking future transactions');
            recommendations.push('Notify compliance team');
        }
        else if (fraudScore.score >= 0.7) {
            recommendations.push('Manual review recommended');
            recommendations.push('Enhanced monitoring for related transactions');
        }
        else if (fraudScore.score >= 0.5) {
            recommendations.push('Automated monitoring');
            recommendations.push('Periodic review');
        }
        if (fraudScore.anomalies.length > 0) {
            recommendations.push(`Investigate ${fraudScore.anomalies.length} detected anomalies`);
        }
        return recommendations;
    }
    /**
     * Verify Merkle proof
     */
    async verifyProof(transaction, proof, expectedRootHash) {
        return this.merkleTree.verifyProof(transaction, proof, expectedRootHash);
    }
    /**
     * Add fraud pattern to database
     */
    async addFraudPattern(pattern) {
        await this.fraudDetection.addFraudPattern(pattern);
        this.logger.info(`Added fraud pattern: ${pattern.name}`);
    }
}
exports.ForensicAgent = ForensicAgent;
//# sourceMappingURL=forensic-agent.js.map