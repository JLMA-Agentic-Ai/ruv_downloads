/**
 * Zod schemas for Active Mandate validation
 */
import { z } from "zod";
export declare const spendCapSchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodString;
    period: z.ZodEnum<{
        single: "single";
        daily: "daily";
        weekly: "weekly";
        monthly: "monthly";
    }>;
}, z.core.$strip>;
export declare const mandateSchema: z.ZodObject<{
    mandate_id: z.ZodString;
    kind: z.ZodEnum<{
        intent: "intent";
        cart: "cart";
    }>;
    agent: z.ZodString;
    holder: z.ZodString;
    cap: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
        period: z.ZodEnum<{
            single: "single";
            daily: "daily";
            weekly: "weekly";
            monthly: "monthly";
        }>;
    }, z.core.$strip>;
    merchant_allow: z.ZodOptional<z.ZodArray<z.ZodString>>;
    merchant_block: z.ZodOptional<z.ZodArray<z.ZodString>>;
    not_before: z.ZodOptional<z.ZodString>;
    expires_at: z.ZodString;
    line_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        qty: z.ZodNumber;
        unit_amount: z.ZodNumber;
        currency: z.ZodString;
    }, z.core.$strip>>>;
    total_amount: z.ZodOptional<z.ZodNumber>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    revocation_url: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const signedMandateSchema: z.ZodObject<{
    alg: z.ZodLiteral<"ed25519">;
    pubkey: z.ZodString;
    signature: z.ZodString;
    payload: z.ZodObject<{
        mandate_id: z.ZodString;
        kind: z.ZodEnum<{
            intent: "intent";
            cart: "cart";
        }>;
        agent: z.ZodString;
        holder: z.ZodString;
        cap: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
            period: z.ZodEnum<{
                single: "single";
                daily: "daily";
                weekly: "weekly";
                monthly: "monthly";
            }>;
        }, z.core.$strip>;
        merchant_allow: z.ZodOptional<z.ZodArray<z.ZodString>>;
        merchant_block: z.ZodOptional<z.ZodArray<z.ZodString>>;
        not_before: z.ZodOptional<z.ZodString>;
        expires_at: z.ZodString;
        line_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sku: z.ZodString;
            qty: z.ZodNumber;
            unit_amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>>>;
        total_amount: z.ZodOptional<z.ZodNumber>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        revocation_url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type SignedMandateSchema = z.infer<typeof signedMandateSchema>;
//# sourceMappingURL=schema.d.ts.map