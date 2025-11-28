/**
 * Agent Identity - Pure TypeScript implementation with @noble/ed25519
 * No WASM dependencies - native cryptography only
 */
export interface AgentIdentityJSON {
    did: string;
    publicKey: string;
    privateKey?: string;
    createdAt: number;
}
/**
 * Agent Identity with Ed25519 cryptography
 * 100% native TypeScript implementation using @noble/ed25519
 */
export declare class AgentIdentity {
    private privateKeyBytes;
    private publicKeyBytes;
    private didString;
    private createdAtMs;
    private constructor();
    /**
     * Generate a new agent identity with random keypair
     */
    static generate(): Promise<AgentIdentity>;
    /**
     * Create identity from existing keys
     */
    static fromKeys(privateKey: Uint8Array | string, publicKey: Uint8Array | string): Promise<AgentIdentity>;
    /**
     * Create identity from only public key (verification-only)
     */
    static fromPublicKey(publicKey: Uint8Array | string): AgentIdentity;
    /**
     * Sign a message with this identity's private key
     */
    sign(message: string | Uint8Array): Promise<Uint8Array>;
    /**
     * Verify a signature against this identity's public key
     */
    verify(signature: Uint8Array | string, message: string | Uint8Array): Promise<boolean>;
    /**
     * Get DID (Decentralized Identifier)
     */
    did(): string;
    /**
     * Get public key as hex string
     */
    publicKeyHex(): string;
    /**
     * Get public key as bytes
     */
    publicKey(): Uint8Array;
    /**
     * Get private key as hex string (sensitive!)
     */
    privateKeyHex(): string;
    /**
     * Get private key as bytes (sensitive!)
     */
    privateKey(): Uint8Array;
    /**
     * Check if this identity has a private key
     */
    canSign(): boolean;
    /**
     * Get creation timestamp
     */
    createdAt(): Date;
    /**
     * Export to JSON (with optional private key)
     */
    toJSON(includePrivateKey?: boolean): AgentIdentityJSON;
    /**
     * Import from JSON
     */
    static fromJSON(json: AgentIdentityJSON): Promise<AgentIdentity>;
}
//# sourceMappingURL=identity.d.ts.map