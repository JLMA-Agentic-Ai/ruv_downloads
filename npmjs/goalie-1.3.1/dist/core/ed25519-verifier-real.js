/**
 * Ed25519 Signature Verification System - REAL IMPLEMENTATION
 * Provides cryptographic verification of sources and citations
 * Uses @noble/ed25519 for actual cryptographic operations
 */
import * as ed25519 from '@noble/ed25519';
import { createHash } from 'crypto';
export class Ed25519Verifier {
    config;
    trustedKeys = new Map(); // keyId -> publicKey
    certificateStore = new Map();
    // Well-known trusted root certificates (in production, load from secure storage)
    TRUSTED_ROOTS = new Map([
        // Example trusted root keys (these would be real in production)
        ['reuters.com', 'BGZyb290LXB1YmxpYy1rZXktZXhhbXBsZQ=='], // Example, not real
        ['ap.org', 'QVAtcm9vdC1wdWJsaWMta2V5LWV4YW1wbGU='], // Example, not real
        ['sec.gov', 'U0VDLXJvb3QtcHVibGljLWtleS1leGFtcGxl'] // Example, not real
    ]);
    constructor(config) {
        this.config = config;
        this.initializeTrustedKeys();
    }
    /**
     * Initialize trusted keys from configuration and known sources
     */
    initializeTrustedKeys() {
        // Add configured trusted issuers
        if (this.config.trustedIssuers) {
            for (const issuer of this.config.trustedIssuers) {
                const rootKey = this.TRUSTED_ROOTS.get(issuer);
                if (rootKey) {
                    this.trustedKeys.set(issuer, rootKey);
                }
            }
        }
        // Add user's public key if provided
        if (this.config.publicKey && this.config.keyId) {
            this.trustedKeys.set(this.config.keyId, this.config.publicKey);
        }
    }
    /**
     * Generate a new Ed25519 key pair
     */
    static async generateKeyPair() {
        const privateKey = ed25519.utils.randomSecretKey();
        const publicKey = await ed25519.getPublicKeyAsync(privateKey);
        return {
            privateKey: Buffer.from(privateKey).toString('base64'),
            publicKey: Buffer.from(publicKey).toString('base64')
        };
    }
    /**
     * Sign a message with Ed25519
     */
    async sign(message, privateKeyBase64) {
        const privateKey = privateKeyBase64 || this.config.privateKey;
        if (!privateKey) {
            throw new Error('No private key provided for signing');
        }
        try {
            // Decode base64 private key
            const privateKeyBytes = Buffer.from(privateKey, 'base64');
            // Get public key from private key
            const publicKeyBytes = await ed25519.getPublicKeyAsync(privateKeyBytes);
            // Convert message to bytes
            const messageBytes = Buffer.from(message, 'utf-8');
            // Create signature
            const signatureBytes = await ed25519.signAsync(messageBytes, privateKeyBytes);
            return {
                signature: Buffer.from(signatureBytes).toString('base64'),
                publicKey: Buffer.from(publicKeyBytes).toString('base64'),
                keyId: this.config.keyId,
                timestamp: Date.now(),
                message
            };
        }
        catch (error) {
            throw new Error(`Signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Verify an Ed25519 signature
     */
    async verify(message, signatureBase64, publicKeyBase64) {
        try {
            // Decode base64 values
            const messageBytes = Buffer.from(message, 'utf-8');
            const signatureBytes = Buffer.from(signatureBase64, 'base64');
            const publicKeyBytes = Buffer.from(publicKeyBase64, 'base64');
            // Verify signature
            const isValid = await ed25519.verifyAsync(signatureBytes, messageBytes, publicKeyBytes);
            // Find issuer from trusted keys
            let issuer;
            for (const [keyId, key] of this.trustedKeys) {
                if (key === publicKeyBase64) {
                    issuer = keyId;
                    break;
                }
            }
            return {
                valid: isValid,
                issuer,
                timestamp: Date.now()
            };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Verification failed'
            };
        }
    }
    /**
     * Sign a citation with Ed25519
     */
    async signCitation(citation) {
        if (!this.config.signResult || !this.config.privateKey) {
            return citation;
        }
        // Create deterministic message from citation data
        const message = JSON.stringify({
            citation: citation.citation,
            url: citation.url,
            timestamp: Date.now()
        });
        const signatureResult = await this.sign(message);
        return {
            ...citation,
            signature: signatureResult.signature,
            publicKey: signatureResult.publicKey,
            issuer: this.config.keyId,
            timestamp: signatureResult.timestamp
        };
    }
    /**
     * Verify a signed citation
     */
    async verifyCitation(citation) {
        if (!citation.signature || !citation.publicKey) {
            return {
                valid: false,
                error: 'No signature present'
            };
        }
        // Recreate the message that was signed
        const message = JSON.stringify({
            citation: citation.citation,
            url: citation.url,
            timestamp: citation.timestamp
        });
        return this.verify(message, citation.signature, citation.publicKey);
    }
    /**
     * Create a mandate certificate
     */
    async createCertificate(subject, publicKeyBase64, validDays = 365, parentCertId) {
        const cert = {
            id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            issuer: this.config.keyId || 'self',
            subject,
            publicKey: publicKeyBase64,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000),
            parent: parentCertId
        };
        // Sign the certificate if we have a private key
        if (this.config.privateKey) {
            const certData = JSON.stringify({
                id: cert.id,
                issuer: cert.issuer,
                subject: cert.subject,
                publicKey: cert.publicKey,
                validFrom: cert.validFrom.toISOString(),
                validUntil: cert.validUntil.toISOString(),
                parent: cert.parent
            });
            const signature = await this.sign(certData);
            cert.signature = signature.signature;
        }
        // Store certificate
        this.certificateStore.set(cert.id, cert);
        return cert;
    }
    /**
     * Verify a certificate chain
     */
    async verifyCertificateChain(certId) {
        const cert = this.certificateStore.get(certId);
        if (!cert) {
            return false;
        }
        // Check validity dates
        const now = new Date();
        if (now < cert.validFrom || now > cert.validUntil) {
            return false;
        }
        // Verify certificate signature
        if (cert.signature) {
            const certData = JSON.stringify({
                id: cert.id,
                issuer: cert.issuer,
                subject: cert.subject,
                publicKey: cert.publicKey,
                validFrom: cert.validFrom.toISOString(),
                validUntil: cert.validUntil.toISOString(),
                parent: cert.parent
            });
            // Find issuer's public key
            let issuerPublicKey;
            // Check if it's a self-signed certificate
            if (cert.issuer === 'self' || cert.issuer === this.config.keyId) {
                issuerPublicKey = this.config.publicKey;
            }
            else {
                // Look up issuer's certificate
                const issuerCert = [...this.certificateStore.values()]
                    .find(c => c.id === cert.issuer || c.subject === cert.issuer);
                issuerPublicKey = issuerCert?.publicKey;
            }
            if (issuerPublicKey) {
                const verification = await this.verify(certData, cert.signature, issuerPublicKey);
                if (!verification.valid) {
                    return false;
                }
            }
        }
        // Verify parent chain if exists
        if (cert.parent) {
            return this.verifyCertificateChain(cert.parent);
        }
        return true;
    }
    /**
     * Verify all citations in a search result
     */
    async verifySearchResult(citations) {
        const results = [];
        const untrusted = [];
        let verified = 0;
        for (const citation of citations) {
            const result = await this.verifyCitation(citation);
            results.push(result);
            if (result.valid) {
                verified++;
            }
            else if (citation.url) {
                // Extract domain from URL
                try {
                    const url = new URL(citation.url);
                    const domain = url.hostname.replace('www.', '');
                    if (!this.trustedKeys.has(domain)) {
                        untrusted.push(domain);
                    }
                }
                catch {
                    untrusted.push('unknown');
                }
            }
        }
        return {
            verified,
            total: citations.length,
            untrusted: [...new Set(untrusted)], // Remove duplicates
            details: results
        };
    }
    /**
     * Hash a message for signing (used for large documents)
     */
    hashMessage(message) {
        const hash = createHash('sha256');
        hash.update(message);
        return hash.digest('base64');
    }
}
/**
 * Export a factory function for creating a verifier with config
 */
export function createEd25519Verifier(config) {
    return new Ed25519Verifier(config);
}
/**
 * Export utility to generate a new key pair
 */
export async function generateEd25519KeyPair() {
    const keyPair = await Ed25519Verifier.generateKeyPair();
    return {
        ...keyPair,
        example: `
# Save these keys securely!
export ED25519_PRIVATE_KEY="${keyPair.privateKey}"
export ED25519_PUBLIC_KEY="${keyPair.publicKey}"

# Or add to .env file:
ED25519_PRIVATE_KEY="${keyPair.privateKey}"
ED25519_PUBLIC_KEY="${keyPair.publicKey}"
    `.trim()
    };
}
//# sourceMappingURL=ed25519-verifier-real.js.map