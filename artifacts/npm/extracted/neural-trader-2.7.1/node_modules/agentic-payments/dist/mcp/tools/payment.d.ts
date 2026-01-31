/**
 * Payment mandate MCP tools (Intent and Cart)
 */
import type { ToolResult, CreateIntentMandateArgs, CreateCartMandateArgs } from './types.js';
/**
 * Create an intent-based payment mandate
 */
export declare function createIntentMandateTool(args: CreateIntentMandateArgs): Promise<ToolResult>;
/**
 * Create a cart-based payment mandate
 */
export declare function createCartMandateTool(args: CreateCartMandateArgs): Promise<ToolResult>;
//# sourceMappingURL=payment.d.ts.map