/**
 * Payment mandate types (Intent, Cart, Payment)
 * Pure TypeScript implementation - no WASM dependencies
 */
import { AgentIdentity } from './identity.js';
export interface CartItem {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
}
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export interface IntentMandateData {
    id: string;
    merchantId: string;
    customerId: string;
    intent: string;
    maxAmount: number;
    currency: string;
    createdAt: number;
    expiresAt: number;
    signature?: string;
    signedBy?: string;
}
export interface CartMandateData {
    id: string;
    merchantId: string;
    customerId: string;
    items: CartItem[];
    totalAmount: number;
    currency: string;
    createdAt: number;
    expiresAt: number;
    signature?: string;
    signedBy?: string;
}
export interface PaymentMandateData {
    id: string;
    sourceId: string;
    type: 'intent' | 'cart';
    amount: number;
    currency: string;
    paymentMethod: string;
    status: PaymentStatus;
    createdAt: number;
    processedAt?: number;
    signature?: string;
    signedBy?: string;
}
/**
 * Intent mandate for payment authorization
 */
export declare class IntentMandate {
    private data;
    constructor(data: Omit<IntentMandateData, 'id' | 'createdAt' | 'signature' | 'signedBy'>);
    private generateId;
    /**
     * Sign mandate with agent identity
     */
    sign(agent: AgentIdentity): Promise<void>;
    /**
     * Get canonical string representation for signing
     */
    private getCanonicalString;
    /**
     * Verify signature
     */
    verify(agent: AgentIdentity): Promise<boolean>;
    /**
     * Validate mandate
     */
    validate(): ValidationResult;
    getData(): IntentMandateData;
    getSignature(): string | undefined;
    toJSON(): IntentMandateData;
}
/**
 * Cart mandate for shopping cart authorization
 */
export declare class CartMandate {
    private data;
    constructor(data: Omit<CartMandateData, 'id' | 'createdAt' | 'totalAmount' | 'signature' | 'signedBy'>);
    private generateId;
    /**
     * Sign mandate with agent identity
     */
    sign(agent: AgentIdentity): Promise<void>;
    private getCanonicalString;
    /**
     * Verify signature
     */
    verify(agent: AgentIdentity): Promise<boolean>;
    /**
     * Validate mandate
     */
    validate(): ValidationResult;
    getData(): CartMandateData;
    getItems(): CartItem[];
    getTotalAmount(): number;
    getSignature(): string | undefined;
    toJSON(): CartMandateData;
}
/**
 * Payment mandate for transaction authorization
 */
export declare class PaymentMandate {
    private data;
    constructor(data: Omit<PaymentMandateData, 'id' | 'createdAt' | 'status' | 'signature' | 'signedBy' | 'processedAt'>);
    private generateId;
    /**
     * Sign mandate with agent identity
     */
    sign(agent: AgentIdentity): Promise<void>;
    private getCanonicalString;
    /**
     * Verify signature
     */
    verify(agent: AgentIdentity): Promise<boolean>;
    /**
     * Validate mandate
     */
    validate(): ValidationResult;
    updateStatus(status: PaymentStatus): void;
    getData(): PaymentMandateData;
    getStatus(): PaymentStatus;
    getSignature(): string | undefined;
    isComplete(): boolean;
    toJSON(): PaymentMandateData;
}
//# sourceMappingURL=mandate.d.ts.map