/**
 * Payment mandate MCP tools (Intent and Cart)
 */
import { IntentMandate, CartMandate } from '../../mandate.js';
/**
 * Create an intent-based payment mandate
 */
export async function createIntentMandateTool(args) {
    try {
        const { merchant_id, customer_id, intent, max_amount, currency = 'USD', expires_at, } = args;
        const mandate = new IntentMandate({
            merchantId: merchant_id,
            customerId: customer_id,
            intent,
            maxAmount: max_amount,
            currency,
            expiresAt: expires_at || Date.now() + 86400000, // Default 24 hours
        });
        return {
            success: true,
            mandate: mandate.toJSON(),
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Create a cart-based payment mandate
 */
export async function createCartMandateTool(args) {
    try {
        const { merchant_id, customer_id, items, currency = 'USD' } = args;
        // Calculate total from items
        const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        // CartMandate constructor takes data without totalAmount (it calculates it)
        const mandate = new CartMandate({
            merchantId: merchant_id,
            customerId: customer_id,
            items: items.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unit_price,
            })),
            currency,
            expiresAt: Date.now() + 86400000, // Default 24 hours
        });
        return {
            success: true,
            mandate: mandate.toJSON(),
            total,
            items_count: items.length,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
//# sourceMappingURL=payment.js.map