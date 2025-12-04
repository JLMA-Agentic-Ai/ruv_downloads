/**
 * Agent Identity - Pure TypeScript implementation with @noble/ed25519
 * No WASM dependencies - native cryptography only
 */
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { PaymentError, PaymentErrorCode } from './errors.js';
// Configure noble/ed25519 to use SHA-512
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
/**
 * Agent Identity with Ed25519 cryptography
 * 100% native TypeScript implementation using @noble/ed25519
 */
export class AgentIdentity {
    privateKeyBytes;
    publicKeyBytes;
    didString;
    createdAtMs;
    constructor(privateKey, publicKey) {
        this.privateKeyBytes = privateKey;
        this.publicKeyBytes = publicKey;
        this.didString = `did:agent:${this.publicKeyHex()}`;
        this.createdAtMs = Date.now();
    }
    /**
     * Generate a new agent identity with random keypair
     */
    static async generate() {
        try {
            const privateKey = ed.utils.randomPrivateKey();
            const publicKey = await ed.getPublicKeyAsync(privateKey);
            return new AgentIdentity(privateKey, publicKey);
        }
        catch (error) {
            throw new PaymentError(PaymentErrorCode.CRYPTO_ERROR, `Failed to generate identity: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    /**
     * Create identity from existing keys
     */
    static async fromKeys(privateKey, publicKey) {
        try {
            const privKeyBytes = typeof privateKey === 'string' ? hexToBytes(privateKey) : privateKey;
            const pubKeyBytes = typeof publicKey === 'string' ? hexToBytes(publicKey) : publicKey;
            // Validate key sizes
            if (privKeyBytes.length !== 32) {
                throw new Error('Private key must be 32 bytes');
            }
            if (pubKeyBytes.length !== 32) {
                throw new Error('Public key must be 32 bytes');
            }
            // Verify keypair matches
            const derivedPublicKey = await ed.getPublicKeyAsync(privKeyBytes);
            if (!areEqual(derivedPublicKey, pubKeyBytes)) {
                throw new Error('Public key does not match private key');
            }
            return new AgentIdentity(privKeyBytes, pubKeyBytes);
        }
        catch (error) {
            throw new PaymentError(PaymentErrorCode.CRYPTO_ERROR, `Failed to create identity from keys: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    /**
     * Create identity from only public key (verification-only)
     */
    static fromPublicKey(publicKey) {
        try {
            const pubKeyBytes = typeof publicKey === 'string' ? hexToBytes(publicKey) : publicKey;
            if (pubKeyBytes.length !== 32) {
                throw new Error('Public key must be 32 bytes');
            }
            // Create with empty private key for verification-only identity
            return new AgentIdentity(new Uint8Array(32), pubKeyBytes);
        }
        catch (error) {
            throw new PaymentError(PaymentErrorCode.CRYPTO_ERROR, `Failed to create identity from public key: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    /**
     * Sign a message with this identity's private key
     */
    async sign(message) {
        try {
            if (this.privateKeyBytes.every(b => b === 0)) {
                throw new Error('Cannot sign with verification-only identity');
            }
            const messageBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
            return await ed.signAsync(messageBytes, this.privateKeyBytes);
        }
        catch (error) {
            throw new PaymentError(PaymentErrorCode.CRYPTO_ERROR, `Failed to sign message: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    /**
     * Verify a signature against this identity's public key
     */
    async verify(signature, message) {
        try {
            const sigBytes = typeof signature === 'string' ? hexToBytes(signature) : signature;
            const messageBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
            return await ed.verifyAsync(sigBytes, messageBytes, this.publicKeyBytes);
        }
        catch (error) {
            // Verification failures return false, not errors
            return false;
        }
    }
    /**
     * Get DID (Decentralized Identifier)
     */
    did() {
        return this.didString;
    }
    /**
     * Get public key as hex string
     */
    publicKeyHex() {
        return bytesToHex(this.publicKeyBytes);
    }
    /**
     * Get public key as bytes
     */
    publicKey() {
        return new Uint8Array(this.publicKeyBytes);
    }
    /**
     * Get private key as hex string (sensitive!)
     */
    privateKeyHex() {
        if (this.privateKeyBytes.every(b => b === 0)) {
            throw new PaymentError(PaymentErrorCode.CRYPTO_ERROR, 'This is a verification-only identity with no private key');
        }
        return bytesToHex(this.privateKeyBytes);
    }
    /**
     * Get private key as bytes (sensitive!)
     */
    privateKey() {
        if (this.privateKeyBytes.every(b => b === 0)) {
            throw new PaymentError(PaymentErrorCode.CRYPTO_ERROR, 'This is a verification-only identity with no private key');
        }
        return new Uint8Array(this.privateKeyBytes);
    }
    /**
     * Check if this identity has a private key
     */
    canSign() {
        return !this.privateKeyBytes.every(b => b === 0);
    }
    /**
     * Get creation timestamp
     */
    createdAt() {
        return new Date(this.createdAtMs);
    }
    /**
     * Export to JSON (with optional private key)
     */
    toJSON(includePrivateKey = false) {
        return {
            did: this.didString,
            publicKey: this.publicKeyHex(),
            privateKey: includePrivateKey && this.canSign() ? this.privateKeyHex() : undefined,
            createdAt: this.createdAtMs,
        };
    }
    /**
     * Import from JSON
     */
    static async fromJSON(json) {
        if (json.privateKey) {
            return AgentIdentity.fromKeys(json.privateKey, json.publicKey);
        }
        else {
            return AgentIdentity.fromPublicKey(json.publicKey);
        }
    }
}
// Utility functions
function hexToBytes(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error('Hex string must have even length');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}
function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
function areEqual(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
//# sourceMappingURL=identity.js.map