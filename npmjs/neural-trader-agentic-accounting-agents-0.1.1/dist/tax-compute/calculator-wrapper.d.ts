/**
 * Calculator Wrapper
 *
 * Wraps Rust tax calculation algorithms with TypeScript-friendly interfaces
 * Handles method selection and result normalization
 */
export type TaxMethod = 'FIFO' | 'LIFO' | 'HIFO' | 'SPECIFIC_ID' | 'AVERAGE_COST';
export interface Transaction {
    id: string;
    transactionType: 'BUY' | 'SELL';
    asset: string;
    quantity: string;
    price: string;
    timestamp: string;
    source: string;
    fees: string;
}
export interface TaxLot {
    id: string;
    transactionId: string;
    asset: string;
    quantity: string;
    remainingQuantity: string;
    costBasis: string;
    acquisitionDate: string;
}
export interface Disposal {
    id: string;
    saleTransactionId: string;
    lotId: string;
    asset: string;
    quantity: string;
    proceeds: string;
    costBasis: string;
    gainLoss: string;
    acquisitionDate: string;
    disposalDate: string;
    isLongTerm: boolean;
}
export interface TaxCalculationResult {
    method: TaxMethod;
    disposals: Disposal[];
    totalGain: string;
    totalLoss: string;
    netGainLoss: string;
    shortTermGain: string;
    longTermGain: string;
    unusedLots: TaxLot[];
    calculationTime: number;
}
export declare class CalculatorWrapper {
    /**
     * Calculate using FIFO method (First In, First Out)
     */
    calculateFifo(sale: Transaction, lots: TaxLot[]): Promise<TaxCalculationResult>;
    /**
     * Calculate using LIFO method (Last In, First Out)
     */
    calculateLifo(sale: Transaction, lots: TaxLot[]): Promise<TaxCalculationResult>;
    /**
     * Calculate using HIFO method (Highest In, First Out)
     */
    calculateHifo(sale: Transaction, lots: TaxLot[]): Promise<TaxCalculationResult>;
    /**
     * Calculate using Specific ID method
     */
    calculateSpecificId(sale: Transaction, lots: TaxLot[], selectedLotIds: string[]): Promise<TaxCalculationResult>;
    /**
     * Calculate using Average Cost method
     */
    calculateAverageCost(sale: Transaction, lots: TaxLot[]): Promise<TaxCalculationResult>;
    /**
     * Process disposals from sale transaction and lots
     */
    private processDisposals;
}
//# sourceMappingURL=calculator-wrapper.d.ts.map