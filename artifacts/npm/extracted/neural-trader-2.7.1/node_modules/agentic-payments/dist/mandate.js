/**
 * Payment mandate types (Intent, Cart, Payment)
 * Pure TypeScript implementation - no WASM dependencies
 */
import { PaymentError, PaymentErrorCode } from './errors.js';
/**
 * Intent mandate for payment authorization
 */
export class IntentMandate {
    data;
    constructor(data) {
        this.data = {
            id: this.generateId(),
            merchantId: data.merchantId,
            customerId: data.customerId,
            intent: data.intent,
            maxAmount: data.maxAmount,
            currency: data.currency,
            createdAt: Date.now(),
            expiresAt: data.expiresAt,
        };
    }
    generateId() {
        return `intent_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * Sign mandate with agent identity
     */
    async sign(agent) {
        try {
            // Create canonical representation for signing
            const canonical = this.getCanonicalString();
            const signature = await agent.sign(canonical);
            // Store signature as hex string
            this.data.signature = Array.from(signature)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            this.data.signedBy = agent.did();
        }
        catch (error) {
            throw new PaymentError(PaymentErrorCode.SIGNATURE_FAILED, `Failed to sign intent mandate: ${error instanceof Error ? error.message : 'unknown error'}`, { mandateId: this.data.id });
        }
    }
    /**
     * Get canonical string representation for signing
     */
    getCanonicalString() {
        return JSON.stringify({
            id: this.data.id,
            merchantId: this.data.merchantId,
            customerId: this.data.customerId,
            intent: this.data.intent,
            maxAmount: this.data.maxAmount,
            currency: this.data.currency,
            createdAt: this.data.createdAt,
            expiresAt: this.data.expiresAt,
        });
    }
    /**
     * Verify signature
     */
    async verify(agent) {
        if (!this.data.signature) {
            return false;
        }
        try {
            const canonical = this.getCanonicalString();
            const sigBytes = new Uint8Array(this.data.signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            return await agent.verify(sigBytes, canonical);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Validate mandate
     */
    validate() {
        const errors = [];
        if (!this.data.merchantId) {
            errors.push('Merchant ID is required');
        }
        if (!this.data.customerId) {
            errors.push('Customer ID is required');
        }
        if (!this.data.intent) {
            errors.push('Intent description is required');
        }
        if (this.data.maxAmount <= 0) {
            errors.push('Max amount must be greater than 0');
        }
        if (!this.data.currency || this.data.currency.length !== 3) {
            errors.push('Valid currency code required (3 letters)');
        }
        if (this.data.expiresAt <= Date.now()) {
            errors.push('Mandate has expired');
        }
        if (!this.data.signature) {
            errors.push('Mandate must be signed');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    getData() {
        return { ...this.data };
    }
    getSignature() {
        return this.data.signature;
    }
    toJSON() {
        return { ...this.data };
    }
}
/**
 * Cart mandate for shopping cart authorization
 */
export class CartMandate {
    data;
    constructor(data) {
        const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        this.data = {
            id: this.generateId(),
            merchantId: data.merchantId,
            customerId: data.customerId,
            items: data.items,
            totalAmount,
            currency: data.currency,
            createdAt: Date.now(),
            expiresAt: data.expiresAt,
        };
    }
    generateId() {
        return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * Sign mandate with agent identity
     */
    async sign(agent) {
        try {
            const canonical = this.getCanonicalString();
            const signature = await agent.sign(canonical);
            this.data.signature = Array.from(signature)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            this.data.signedBy = agent.did();
        }
        catch (error) {
            throw new PaymentError(PaymentErrorCode.SIGNATURE_FAILED, `Failed to sign cart mandate: ${error instanceof Error ? error.message : 'unknown error'}`, { mandateId: this.data.id });
        }
    }
    getCanonicalString() {
        return JSON.stringify({
            id: this.data.id,
            merchantId: this.data.merchantId,
            customerId: this.data.customerId,
            items: this.data.items,
            totalAmount: this.data.totalAmount,
            currency: this.data.currency,
            createdAt: this.data.createdAt,
            expiresAt: this.data.expiresAt,
        });
    }
    /**
     * Verify signature
     */
    async verify(agent) {
        if (!this.data.signature) {
            return false;
        }
        try {
            const canonical = this.getCanonicalString();
            const sigBytes = new Uint8Array(this.data.signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            return await agent.verify(sigBytes, canonical);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Validate mandate
     */
    validate() {
        const errors = [];
        if (!this.data.merchantId) {
            errors.push('Merchant ID is required');
        }
        if (!this.data.customerId) {
            errors.push('Customer ID is required');
        }
        if (!this.data.items || this.data.items.length === 0) {
            errors.push('Cart must have at least one item');
        }
        if (this.data.totalAmount <= 0) {
            errors.push('Total amount must be greater than 0');
        }
        if (!this.data.currency || this.data.currency.length !== 3) {
            errors.push('Valid currency code required (3 letters)');
        }
        if (this.data.expiresAt <= Date.now()) {
            errors.push('Mandate has expired');
        }
        if (!this.data.signature) {
            errors.push('Mandate must be signed');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    getData() {
        return { ...this.data };
    }
    getItems() {
        return [...this.data.items];
    }
    getTotalAmount() {
        return this.data.totalAmount;
    }
    getSignature() {
        return this.data.signature;
    }
    toJSON() {
        return { ...this.data };
    }
}
/**
 * Payment mandate for transaction authorization
 */
export class PaymentMandate {
    data;
    constructor(data) {
        this.data = {
            id: this.generateId(),
            sourceId: data.sourceId,
            type: data.type,
            amount: data.amount,
            currency: data.currency,
            paymentMethod: data.paymentMethod,
            status: 'pending',
            createdAt: Date.now(),
        };
    }
    generateId() {
        return `payment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * Sign mandate with agent identity
     */
    async sign(agent) {
        try {
            const canonical = this.getCanonicalString();
            const signature = await agent.sign(canonical);
            this.data.signature = Array.from(signature)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            this.data.signedBy = agent.did();
        }
        catch (error) {
            throw new PaymentError(PaymentErrorCode.SIGNATURE_FAILED, `Failed to sign payment mandate: ${error instanceof Error ? error.message : 'unknown error'}`, { mandateId: this.data.id });
        }
    }
    getCanonicalString() {
        return JSON.stringify({
            id: this.data.id,
            sourceId: this.data.sourceId,
            type: this.data.type,
            amount: this.data.amount,
            currency: this.data.currency,
            paymentMethod: this.data.paymentMethod,
            status: this.data.status,
            createdAt: this.data.createdAt,
        });
    }
    /**
     * Verify signature
     */
    async verify(agent) {
        if (!this.data.signature) {
            return false;
        }
        try {
            const canonical = this.getCanonicalString();
            const sigBytes = new Uint8Array(this.data.signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            return await agent.verify(sigBytes, canonical);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Validate mandate
     */
    validate() {
        const errors = [];
        if (!this.data.sourceId) {
            errors.push('Source ID is required');
        }
        if (!this.data.type) {
            errors.push('Mandate type is required');
        }
        if (this.data.amount <= 0) {
            errors.push('Amount must be greater than 0');
        }
        if (!this.data.currency || this.data.currency.length !== 3) {
            errors.push('Valid currency code required (3 letters)');
        }
        if (!this.data.paymentMethod) {
            errors.push('Payment method is required');
        }
        if (!this.data.signature) {
            errors.push('Mandate must be signed');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    updateStatus(status) {
        this.data.status = status;
        if (status !== 'pending' && !this.data.processedAt) {
            this.data.processedAt = Date.now();
        }
    }
    getData() {
        return { ...this.data };
    }
    getStatus() {
        return this.data.status;
    }
    getSignature() {
        return this.data.signature;
    }
    isComplete() {
        return ['captured', 'failed', 'cancelled', 'refunded'].includes(this.data.status);
    }
    toJSON() {
        return { ...this.data };
    }
}
//# sourceMappingURL=mandate.js.map