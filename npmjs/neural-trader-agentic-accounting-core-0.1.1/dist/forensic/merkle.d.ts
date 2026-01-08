/**
 * Merkle Proof System
 * Generate tamper-evident audit trails
 */
import { Transaction } from '@neural-trader/agentic-accounting-types';
export interface MerkleNode {
    hash: string;
    left?: MerkleNode;
    right?: MerkleNode;
    data?: any;
}
export interface MerkleProof {
    transactionId: string;
    rootHash: string;
    proof: string[];
    index: number;
    timestamp: Date;
}
export declare class MerkleTreeService {
    /**
     * Build Merkle tree from transactions
     */
    buildTree(transactions: Transaction[]): MerkleNode;
    /**
     * Generate Merkle proof for a transaction
     */
    generateProof(transactions: Transaction[], transactionId: string): MerkleProof;
    /**
     * Verify Merkle proof
     */
    verifyProof(transaction: Transaction, proof: MerkleProof, expectedRootHash: string): boolean;
    /**
     * Hash a transaction
     */
    private hashTransaction;
    /**
     * Hash a pair of nodes
     */
    private hashPair;
    /**
     * Get root hash of transaction set
     */
    getRootHash(transactions: Transaction[]): string;
    /**
     * Batch generate proofs for all transactions
     */
    generateAllProofs(transactions: Transaction[]): Map<string, MerkleProof>;
    /**
     * Verify batch of proofs
     */
    verifyAllProofs(transactions: Transaction[], proofs: Map<string, MerkleProof>, expectedRootHash: string): Map<string, boolean>;
}
//# sourceMappingURL=merkle.d.ts.map