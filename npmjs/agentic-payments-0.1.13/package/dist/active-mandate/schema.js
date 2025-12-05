/**
 * Zod schemas for Active Mandate validation
 */
import { z } from "zod";
export const spendCapSchema = z.object({
    amount: z.number().int().nonnegative(),
    currency: z.string(),
    period: z.enum(["single", "daily", "weekly", "monthly"])
});
export const mandateSchema = z.object({
    mandate_id: z.string().min(4),
    kind: z.enum(["intent", "cart"]),
    agent: z.string().min(1),
    holder: z.string().min(1),
    cap: spendCapSchema,
    merchant_allow: z.array(z.string()).optional(),
    merchant_block: z.array(z.string()).optional(),
    not_before: z.string().datetime().optional(),
    expires_at: z.string().datetime(),
    line_items: z.array(z.object({
        sku: z.string(),
        qty: z.number().int().positive(),
        unit_amount: z.number().int().nonnegative(),
        currency: z.string()
    })).optional(),
    total_amount: z.number().int().nonnegative().optional(),
    meta: z.record(z.string(), z.any()).optional(),
    revocation_url: z.string().url().optional()
});
export const signedMandateSchema = z.object({
    alg: z.literal("ed25519"),
    pubkey: z.string().min(8),
    signature: z.string().min(8),
    payload: mandateSchema
});
//# sourceMappingURL=schema.js.map