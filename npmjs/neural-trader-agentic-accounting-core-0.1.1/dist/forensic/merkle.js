"use strict";
/**
 * Merkle Proof System
 * Generate tamper-evident audit trails
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTreeService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
class MerkleTreeService {
    /**
     * Build Merkle tree from transactions
     */
    buildTree(transactions) {
        if (transactions.length === 0) {
            throw new Error('Cannot build Merkle tree from empty transaction list');
        }
        // Create leaf nodes
        let nodes = transactions.map(tx => ({
            hash: this.hashTransaction(tx),
            data: tx
        }));
        // Build tree bottom-up
        while (nodes.length > 1) {
            const parentNodes = [];
            for (let i = 0; i < nodes.length; i += 2) {
                const left = nodes[i];
                const right = i + 1 < nodes.length ? nodes[i + 1] : left;
                const parentHash = this.hashPair(left.hash, right.hash);
                parentNodes.push({
                    hash: parentHash,
                    left,
                    right
                });
            }
            nodes = parentNodes;
        }
        logger_1.logger.debug('Merkle tree built', {
            rootHash: nodes[0].hash,
            transactions: transactions.length
        });
        return nodes[0]; // Root node
    }
    /**
     * Generate Merkle proof for a transaction
     */
    generateProof(transactions, transactionId) {
        const index = transactions.findIndex(tx => tx.id === transactionId);
        if (index === -1) {
            throw new Error(`Transaction ${transactionId} not found in transaction list`);
        }
        const proof = [];
        const tree = this.buildTree(transactions);
        // Generate proof by walking up the tree
        let currentIndex = index;
        let levelNodes = transactions.length;
        // Rebuild tree to get proof path
        let nodes = transactions.map(tx => this.hashTransaction(tx));
        while (nodes.length > 1) {
            const newNodes = [];
            for (let i = 0; i < nodes.length; i += 2) {
                if (i === currentIndex) {
                    // Found our node, add sibling to proof
                    const siblingIndex = i % 2 === 0 ? i + 1 : i - 1;
                    if (siblingIndex < nodes.length) {
                        proof.push(nodes[siblingIndex]);
                    }
                    currentIndex = Math.floor(i / 2);
                }
                else if (i + 1 === currentIndex) {
                    // Our node is the right sibling
                    proof.push(nodes[i]);
                    currentIndex = Math.floor(i / 2);
                }
                const left = nodes[i];
                const right = i + 1 < nodes.length ? nodes[i + 1] : left;
                newNodes.push(this.hashPair(left, right));
            }
            nodes = newNodes;
        }
        return {
            transactionId,
            rootHash: tree.hash,
            proof,
            index,
            timestamp: new Date()
        };
    }
    /**
     * Verify Merkle proof
     */
    verifyProof(transaction, proof, expectedRootHash) {
        let hash = this.hashTransaction(transaction);
        let index = proof.index;
        // Reconstruct root hash using proof
        for (const siblingHash of proof.proof) {
            if (index % 2 === 0) {
                hash = this.hashPair(hash, siblingHash);
            }
            else {
                hash = this.hashPair(siblingHash, hash);
            }
            index = Math.floor(index / 2);
        }
        const isValid = hash === expectedRootHash;
        logger_1.logger.debug('Merkle proof verification', {
            transactionId: transaction.id,
            isValid,
            computedRoot: hash,
            expectedRoot: expectedRootHash
        });
        return isValid;
    }
    /**
     * Hash a transaction
     */
    hashTransaction(transaction) {
        const data = JSON.stringify({
            id: transaction.id,
            timestamp: transaction.timestamp.toISOString(),
            type: transaction.type,
            asset: transaction.asset,
            quantity: transaction.quantity,
            price: transaction.price,
            fees: transaction.fees
        });
        return crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
    /**
     * Hash a pair of nodes
     */
    hashPair(left, right) {
        return crypto_1.default
            .createHash('sha256')
            .update(left + right)
            .digest('hex');
    }
    /**
     * Get root hash of transaction set
     */
    getRootHash(transactions) {
        const tree = this.buildTree(transactions);
        return tree.hash;
    }
    /**
     * Batch generate proofs for all transactions
     */
    generateAllProofs(transactions) {
        const proofs = new Map();
        for (const tx of transactions) {
            const proof = this.generateProof(transactions, tx.id);
            proofs.set(tx.id, proof);
        }
        logger_1.logger.info(`Generated ${proofs.size} Merkle proofs`);
        return proofs;
    }
    /**
     * Verify batch of proofs
     */
    verifyAllProofs(transactions, proofs, expectedRootHash) {
        const results = new Map();
        for (const tx of transactions) {
            const proof = proofs.get(tx.id);
            if (proof) {
                const isValid = this.verifyProof(tx, proof, expectedRootHash);
                results.set(tx.id, isValid);
            }
            else {
                results.set(tx.id, false);
            }
        }
        return results;
    }
}
exports.MerkleTreeService = MerkleTreeService;
//# sourceMappingURL=merkle.js.map