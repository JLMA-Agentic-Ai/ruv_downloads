import { VaultQuantumRetrieveInput } from '../types/schemas.js';
export declare function vaultQuantumRetrieve(input: VaultQuantumRetrieveInput): Promise<{
    secret: {
        label: string;
        data: string;
        category: string;
        tags: string[];
    };
    metadata: {
        entry_id: string;
        created_at: string;
        last_accessed: string;
        access_count: number;
        expires_at: string | undefined;
    };
    verification: {
        integrity_valid: boolean;
        signature_valid: boolean;
        not_expired: boolean;
    };
    decryption: {
        algorithm: string;
        decryption_time_ms: number;
    };
}>;
//# sourceMappingURL=vault-quantum-retrieve.d.ts.map