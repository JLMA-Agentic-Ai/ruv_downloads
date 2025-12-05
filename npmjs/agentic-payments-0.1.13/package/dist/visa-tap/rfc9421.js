/**
 * RFC 9421 HTTP Message Signatures
 *
 * Implements cryptographic signing and verification of HTTP requests per RFC 9421
 */
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import * as ed25519 from '@noble/ed25519';
/**
 * Sign HTTP message per RFC 9421
 */
export async function signHttpMessage(components, privateKeyHex, keyId) {
    const nonce = generateNonce();
    const created = Math.floor(Date.now() / 1000);
    // Build signature base
    const baseParts = [
        `"@method": ${components.method}`,
        `"@authority": ${components.authority}`,
        `"@path": ${components.path}`,
    ];
    if (components.contentDigest) {
        baseParts.push(`"content-digest": ${components.contentDigest}`);
    }
    if (components.headers) {
        for (const [name, value] of Object.entries(components.headers)) {
            baseParts.push(`"${name.toLowerCase()}": ${value}`);
        }
    }
    // Add signature parameters
    baseParts.push(`"@signature-params": ("@method" "@authority" "@path");created=${created};nonce="${nonce}";keyid="${keyId}"`);
    const signatureBase = baseParts.join('\n');
    // Sign with Ed25519
    const privateKey = hexToBytes(privateKeyHex);
    const messageBytes = new TextEncoder().encode(signatureBase);
    const signatureBytes = await ed25519.sign(messageBytes, privateKey);
    const signatureB64 = Buffer.from(signatureBytes).toString('base64');
    // Build Signature-Input header
    const signatureInput = `sig1=("@method" "@authority" "@path");created=${created};nonce="${nonce}";keyid="${keyId}";alg="ed25519"`;
    return {
        signatureInput,
        signature: `sig1=:${signatureB64}:`,
        nonce,
        created,
    };
}
/**
 * Verify RFC 9421 HTTP signature
 *
 * @param maxAgeSeconds - Maximum age of signature in seconds (default: 300 = 5 minutes)
 */
export async function verifyHttpSignature(components, signed, publicKeyHex, maxAgeSeconds = 300) {
    try {
        // Validate timestamp to prevent replay attacks
        const now = Math.floor(Date.now() / 1000);
        const age = Math.abs(now - signed.created);
        if (age > maxAgeSeconds) {
            console.error(`Signature expired: age=${age}s, max=${maxAgeSeconds}s`);
            return false;
        }
        // Reconstruct signature base
        const baseParts = [
            `"@method": ${components.method}`,
            `"@authority": ${components.authority}`,
            `"@path": ${components.path}`,
        ];
        if (components.contentDigest) {
            baseParts.push(`"content-digest": ${components.contentDigest}`);
        }
        if (components.headers) {
            for (const [name, value] of Object.entries(components.headers)) {
                baseParts.push(`"${name.toLowerCase()}": ${value}`);
            }
        }
        // Extract keyid from signature input
        const keyId = extractKeyId(signed.signatureInput);
        // Add signature parameters
        baseParts.push(`"@signature-params": ("@method" "@authority" "@path");created=${signed.created};nonce="${signed.nonce}";keyid="${keyId}"`);
        const signatureBase = baseParts.join('\n');
        // Extract signature bytes
        const sigMatch = signed.signature.match(/^sig1=:(.+):$/);
        if (!sigMatch || !sigMatch[1]) {
            throw new Error('Invalid signature format');
        }
        const signatureB64 = sigMatch[1];
        const signatureBytes = Buffer.from(signatureB64, 'base64');
        // Verify with Ed25519
        const publicKey = hexToBytes(publicKeyHex);
        const messageBytes = new TextEncoder().encode(signatureBase);
        return await ed25519.verify(signatureBytes, messageBytes, publicKey);
    }
    catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
}
/**
 * Compute content digest (SHA-256)
 */
export function computeContentDigest(body) {
    const hash = sha256(body);
    const hashB64 = Buffer.from(hash).toString('base64');
    return `sha-256=:${hashB64}:`;
}
/**
 * Generate cryptographic nonce (16 bytes)
 */
function generateNonce() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
}
/**
 * Extract keyid from Signature-Input header
 */
function extractKeyId(signatureInput) {
    const match = signatureInput.match(/keyid="([^"]+)"/);
    if (!match || !match[1]) {
        throw new Error('Missing keyid in signature-input');
    }
    return match[1];
}
//# sourceMappingURL=rfc9421.js.map