/**
 * Ed25519 Signature Verification System - REAL IMPLEMENTATION
 * Provides cryptographic verification of sources and citations
 * Uses @noble/ed25519 for actual cryptographic operations
 */
export interface Ed25519Config {
    enabled: boolean;
    requireSignatures?: boolean;
    signResult?: boolean;
    privateKey?: string;
    publicKey?: string;
    keyId?: string;
    certId?: string;
    trustedIssuers?: string[];
}
export interface SignatureResult {
    signature: string;
    publicKey: string;
    keyId?: string;
    timestamp: number;
    message: string;
}
export interface VerificationResult {
    valid: boolean;
    keyId?: string;
    issuer?: string;
    timestamp?: number;
    error?: string;
}
export interface MandateCertificate {
    id: string;
    issuer: string;
    subject: string;
    publicKey: string;
    validFrom: Date;
    validUntil: Date;
    signature?: string;
    parent?: string;
}
export interface CitationSignature {
    citation: string;
    url: string;
    signature?: string;
    publicKey?: string;
    issuer?: string;
    timestamp?: number;
}
export declare class Ed25519Verifier {
    private config;
    private trustedKeys;
    private certificateStore;
    private readonly TRUSTED_ROOTS;
    constructor(config: Ed25519Config);
    /**
     * Initialize trusted keys from configuration and known sources
     */
    private initializeTrustedKeys;
    /**
     * Generate a new Ed25519 key pair
     */
    static generateKeyPair(): Promise<{
        privateKey: string;
        publicKey: string;
    }>;
    /**
     * Sign a message with Ed25519
     */
    sign(message: string, privateKeyBase64?: string): Promise<SignatureResult>;
    /**
     * Verify an Ed25519 signature
     */
    verify(message: string, signatureBase64: string, publicKeyBase64: string): Promise<VerificationResult>;
    /**
     * Sign a citation with Ed25519
     */
    signCitation(citation: CitationSignature): Promise<CitationSignature>;
    /**
     * Verify a signed citation
     */
    verifyCitation(citation: CitationSignature): Promise<VerificationResult>;
    /**
     * Create a mandate certificate
     */
    createCertificate(subject: string, publicKeyBase64: string, validDays?: number, parentCertId?: string): Promise<MandateCertificate>;
    /**
     * Verify a certificate chain
     */
    verifyCertificateChain(certId: string): Promise<boolean>;
    /**
     * Verify all citations in a search result
     */
    verifySearchResult(citations: CitationSignature[]): Promise<{
        verified: number;
        total: number;
        untrusted: string[];
        details: VerificationResult[];
    }>;
    /**
     * Hash a message for signing (used for large documents)
     */
    hashMessage(message: string): string;
}
/**
 * Export a factory function for creating a verifier with config
 */
export declare function createEd25519Verifier(config: Ed25519Config): Ed25519Verifier;
/**
 * Export utility to generate a new key pair
 */
export declare function generateEd25519KeyPair(): Promise<{
    privateKey: string;
    publicKey: string;
    example: string;
}>;
//# sourceMappingURL=ed25519-verifier-real.d.ts.map