/**
 * Canonical JSON signing and Ed25519 verification for Active Mandates
 */
import nacl from "tweetnacl";
function decodeBase64(s) {
    if (typeof Buffer !== "undefined")
        return new Uint8Array(Buffer.from(s, "base64"));
    // for environments without Buffer
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
        bytes[i] = bin.charCodeAt(i);
    return bytes;
}
function encodeBase64(bytes) {
    if (typeof Buffer !== "undefined")
        return Buffer.from(bytes).toString("base64");
    // for environments without Buffer
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i] ?? 0);
    }
    return btoa(binary);
}
export function canonicalizeJSON(obj) {
    // deterministic JSON stringify by sorting keys recursively
    const stable = (v) => {
        if (Array.isArray(v))
            return v.map(stable);
        if (v && typeof v === "object") {
            return Object.keys(v).sort().reduce((acc, k) => {
                acc[k] = stable(v[k]);
                return acc;
            }, {});
        }
        return v;
    };
    const text = JSON.stringify(stable(obj));
    if (typeof Buffer !== "undefined")
        return new Uint8Array(Buffer.from(text, "utf8"));
    const encoder = new TextEncoder();
    return encoder.encode(text);
}
export function verifyEd25519Signature(pubkeyBase64, signatureBase64, payload) {
    try {
        const pub = decodeBase64(pubkeyBase64);
        const sig = decodeBase64(signatureBase64);
        const msg = canonicalizeJSON(payload);
        return nacl.sign.detached.verify(msg, sig, pub);
    }
    catch (error) {
        return false;
    }
}
export function signWithTweetnacl(payload, secretKey) {
    const msg = canonicalizeJSON(payload);
    const signature = nacl.sign.detached(msg, secretKey);
    return encodeBase64(signature);
}
export function getPublicKeyBase64(secretKey) {
    const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
    return encodeBase64(keyPair.publicKey);
}
//# sourceMappingURL=signing.js.map