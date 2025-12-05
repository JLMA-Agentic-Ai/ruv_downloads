/**
 * Self-Consistency and Multi-Agent Verification Plugin
 * Implements self-consistency checking through multiple sampling and voting
 */
import { PerplexityClient } from '../../actions/perplexity-actions.js';
export class SelfConsistencyPlugin {
    name = 'self-consistency';
    version = '1.0.0';
    samplingRounds = 3; // Number of times to sample
    consistencyThreshold = 0.7; // 70% agreement required
    samples = null;
    perplexityClient = null;
    hooks = {
        /**
         * Before synthesis, run multiple samples for consistency
         */
        beforeSynthesize: async (context) => {
            const query = context.query || 'unknown query';
            const searchResults = context.searchResults;
            console.log('🔄 [Self-Consistency] Running multiple sampling rounds...');
            // Generate multiple independent samples
            const samples = await this.generateMultipleSamples(query, searchResults);
            // Check consistency across samples
            const consensus = this.calculateConsensus(samples);
            this.samples = {
                query,
                samples,
                consensus
            };
            // Add consensus data to context
            context.metadata = {
                ...context.metadata,
                selfConsistency: {
                    rounds: this.samplingRounds,
                    agreement: consensus.agreement,
                    hasConsensus: consensus.agreement >= this.consistencyThreshold
                }
            };
            console.log(`📊 [Self-Consistency] Agreement level: ${(consensus.agreement * 100).toFixed(1)}%`);
            // If low consistency, add warning
            if (consensus.agreement < this.consistencyThreshold) {
                console.log('⚠️ [Self-Consistency] Low consensus detected - activating additional verification');
                context.requiresAdditionalVerification = true;
            }
        },
        /**
         * After synthesis, verify against consensus
         */
        afterSynthesize: async (result, context) => {
            if (!this.samples)
                return result;
            // Enhance result with consistency data
            result.consistency = {
                method: 'self-consistency-voting',
                samples: this.samplingRounds,
                agreement: this.samples.consensus.agreement,
                confidence: this.calculateConfidence(this.samples.consensus.agreement),
                conflictingPoints: this.samples.consensus.conflictingPoints
            };
            // If high consistency, mark as verified
            if (this.samples.consensus.agreement >= 0.9) {
                result.verified = true;
                result.verificationMethod = 'high-consistency-consensus';
            }
            return result;
        },
        /**
         * Verify through consistency checking
         */
        verify: async (result, context) => {
            if (!this.samples) {
                return { valid: false, confidence: 0, method: 'no-samples' };
            }
            const isConsistent = this.samples.consensus.agreement >= this.consistencyThreshold;
            const hasContradictions = this.samples.consensus.conflictingPoints.length > 0;
            // Multi-factor verification
            const verificationScore = this.calculateVerificationScore({
                consistency: this.samples.consensus.agreement,
                contradictions: hasContradictions ? 0 : 1,
                citationCoverage: this.calculateCitationCoverage(this.samples.samples)
            });
            return {
                valid: verificationScore > 0.7,
                confidence: verificationScore,
                method: 'self-consistency-verification',
                details: {
                    agreement: this.samples.consensus.agreement,
                    conflictCount: this.samples.consensus.conflictingPoints.length,
                    samples: this.samplingRounds
                }
            };
        }
    };
    /**
     * Get or create Perplexity client
     */
    getClient() {
        if (!this.perplexityClient) {
            const apiKey = process.env.PERPLEXITY_API_KEY;
            if (!apiKey) {
                throw new Error('PERPLEXITY_API_KEY is required for self-consistency checking');
            }
            this.perplexityClient = new PerplexityClient(apiKey);
        }
        return this.perplexityClient;
    }
    /**
     * Generate multiple independent samples using real Perplexity API
     */
    async generateMultipleSamples(query, searchResults) {
        const client = this.getClient();
        const samples = [];
        // Use different temperatures for variety in sampling
        const temperatures = [0.3, 0.5, 0.7];
        for (let i = 0; i < this.samplingRounds; i++) {
            // Generate response with different temperature for variety
            const response = await client.chat({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a research assistant. Answer the question based on the provided context. Be specific and cite relevant information.'
                    },
                    {
                        role: 'user',
                        content: `Question: ${query}\n\nContext: ${JSON.stringify(searchResults).substring(0, 2000)}\n\nProvide a clear answer:`
                    }
                ],
                model: 'sonar',
                temperature: temperatures[i % temperatures.length],
                maxTokens: 500
            });
            const sampleResponse = response.choices[0]?.message?.content || '';
            const sample = {
                id: `sample-${i + 1}`,
                response: sampleResponse,
                citations: this.extractCitations(searchResults),
                confidence: 0.7 + (1.0 - temperatures[i % temperatures.length]) * 0.3 // Higher confidence for lower temps
            };
            samples.push(sample);
        }
        return samples;
    }
    /**
     * Extract citations from search results
     */
    extractCitations(searchResults) {
        if (Array.isArray(searchResults)) {
            return searchResults.flatMap(r => r.citations || []);
        }
        return searchResults?.citations || [];
    }
    /**
     * Calculate consensus among samples
     */
    calculateConsensus(samples) {
        // Compare samples for agreement
        const responseTokens = samples.map(s => this.tokenize(s.response));
        // Find common tokens across all samples
        const commonTokens = this.findCommonTokens(responseTokens);
        const totalUniqueTokens = new Set(responseTokens.flat()).size;
        const agreement = commonTokens.size / totalUniqueTokens;
        // Identify conflicting points
        const conflictingPoints = this.identifyConflicts(samples);
        // Determine majority response (simplified)
        const majorityResponse = samples[0].response; // In production, use actual voting
        return {
            agreement,
            majorityResponse,
            conflictingPoints
        };
    }
    /**
     * Tokenize text for comparison
     */
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(token => token.length > 3);
    }
    /**
     * Find common tokens across all samples
     */
    findCommonTokens(tokenArrays) {
        if (tokenArrays.length === 0)
            return new Set();
        let common = new Set(tokenArrays[0]);
        for (let i = 1; i < tokenArrays.length; i++) {
            const current = new Set(tokenArrays[i]);
            common = new Set([...common].filter(token => current.has(token)));
        }
        return common;
    }
    /**
     * Identify conflicting points in samples
     */
    identifyConflicts(samples) {
        const conflicts = [];
        // Check for numerical conflicts
        const numbers = samples.map(s => {
            const matches = s.response.match(/\d+/g);
            return matches ? matches.map(Number) : [];
        });
        // If different numbers appear, flag as conflict
        const uniqueNumbers = new Set(numbers.flat());
        if (uniqueNumbers.size > numbers.length) {
            conflicts.push('Numerical inconsistencies detected');
        }
        // Check for negation conflicts
        const hasNegation = samples.some(s => /not|never|no\s/i.test(s.response));
        const hasAffirmation = samples.some(s => /yes|always|definitely/i.test(s.response));
        if (hasNegation && hasAffirmation) {
            conflicts.push('Conflicting affirmation/negation patterns');
        }
        return conflicts;
    }
    /**
     * Calculate confidence based on agreement level
     */
    calculateConfidence(agreement) {
        // Non-linear confidence scaling
        if (agreement >= 0.9)
            return 0.95;
        if (agreement >= 0.8)
            return 0.85;
        if (agreement >= 0.7)
            return 0.70;
        if (agreement >= 0.6)
            return 0.50;
        return 0.30;
    }
    /**
     * Calculate citation coverage across samples
     */
    calculateCitationCoverage(samples) {
        const allCitations = samples.flatMap(s => s.citations);
        const uniqueCitations = new Set(allCitations);
        // Average citations per sample
        const avgCitations = allCitations.length / samples.length;
        // Coverage score based on unique vs total
        return uniqueCitations.size / Math.max(avgCitations, 1);
    }
    /**
     * Calculate overall verification score
     */
    calculateVerificationScore(factors) {
        const weights = {
            consistency: 0.4,
            contradictions: 0.3,
            citationCoverage: 0.3
        };
        return Object.keys(weights).reduce((score, key) => {
            return score + (factors[key] * weights[key]);
        }, 0);
    }
    /**
     * Generate samples for standalone execution using real API
     */
    async generateSamples(query, count) {
        const client = this.getClient();
        const samples = [];
        // Use different prompting strategies for variety
        const strategies = [
            'Provide a direct answer to: ',
            'Analyze and explain: ',
            'What does the evidence suggest about: ',
            'Based on current knowledge, ',
            'Research indicates that regarding: '
        ];
        const temperatures = [0.3, 0.5, 0.7, 0.4, 0.6];
        for (let i = 0; i < count; i++) {
            const response = await client.chat({
                messages: [
                    {
                        role: 'user',
                        content: `${strategies[i % strategies.length]}${query}`
                    }
                ],
                model: 'sonar',
                temperature: temperatures[i % temperatures.length],
                maxTokens: 200
            });
            samples.push(response.choices[0]?.message?.content || `Sample ${i + 1} for ${query}`);
        }
        return samples;
    }
    /**
     * Check consistency between samples
     */
    checkConsistency(samples) {
        const tokens = samples.map(s => this.tokenize(s));
        const common = this.findCommonTokens(tokens);
        const allTokens = new Set(tokens.flat());
        return common.size / Math.max(allTokens.size, 1);
    }
    /**
     * Cluster similar answers
     */
    clusterAnswers(answers) {
        const clusters = new Map();
        for (const answer of answers) {
            let assigned = false;
            for (const [key, cluster] of clusters) {
                if (this.calculateSimilarity(answer, key) > 0.7) {
                    cluster.push(answer);
                    assigned = true;
                    break;
                }
            }
            if (!assigned) {
                clusters.set(answer, [answer]);
            }
        }
        return clusters;
    }
    /**
     * Simple similarity calculation
     */
    calculateSimilarity(a, b) {
        const wordsA = new Set(a.toLowerCase().split(' '));
        const wordsB = new Set(b.toLowerCase().split(' '));
        const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
        const union = new Set([...wordsA, ...wordsB]);
        return intersection.size / union.size;
    }
    /**
     * Execute self-consistency checking directly
     */
    async execute(params) {
        const query = params.query || 'test query';
        const samples = params.samples || 5;
        console.log(`🔄 Applying Self-Consistency checking...`);
        console.log(`  Query: ${query}`);
        console.log(`  Samples: ${samples}`);
        // Generate multiple reasoning samples
        const reasoningSamples = await this.generateSamples(query, samples);
        // Check consistency
        const consistencyScore = this.checkConsistency(reasoningSamples);
        // Find consensus answer
        const clusters = this.clusterAnswers(reasoningSamples);
        const largestCluster = [...clusters.entries()].reduce((best, [key, cluster]) => cluster.length > best[1].length ? [key, cluster] : best);
        return {
            success: true,
            method: 'self-consistency',
            query,
            samples: {
                total: samples,
                generated: reasoningSamples.length
            },
            consistency: {
                score: consistencyScore,
                rating: consistencyScore > 0.8 ? 'High' : consistencyScore > 0.5 ? 'Medium' : 'Low'
            },
            consensus: {
                answer: largestCluster[0],
                support: largestCluster[1].length,
                percentage: (largestCluster[1].length / samples * 100).toFixed(1)
            },
            reasoning: `Self-Consistency Analysis for "${query}":\n\n` +
                `Generated ${samples} independent reasoning samples.\n` +
                `Consistency Score: ${(consistencyScore * 100).toFixed(1)}%\n\n` +
                `Consensus Answer (${largestCluster[1].length}/${samples} samples agree):\n` +
                `"${largestCluster[0]}"\n\n` +
                `This approach ensures reliability by checking if multiple ` +
                `independent reasoning paths reach the same conclusion.`,
            allClusters: [...clusters.entries()].map(([key, cluster]) => ({
                representative: key,
                count: cluster.length,
                percentage: (cluster.length / samples * 100).toFixed(1)
            }))
        };
    }
}
export default new SelfConsistencyPlugin();
//# sourceMappingURL=self-consistency-plugin.js.map