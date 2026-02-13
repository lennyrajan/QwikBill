export const GST_SLABS = [0, 5, 12, 18, 28];

export interface LineItemTotals {
    itemTotal: number;
    taxAmount: number;
    taxableAmount: number;
}

export function calculateLineItem(price: number, quantity: number, taxSlab: number): LineItemTotals {
    const taxableAmount = price * quantity;
    const taxAmount = (taxableAmount * taxSlab) / 100;
    const itemTotal = taxableAmount + taxAmount;

    return {
        taxableAmount,
        taxAmount,
        itemTotal
    };
}

export function roundToNearestRupee(amount: number): { rounded: number; diff: number } {
    const rounded = Math.round(amount);
    const diff = rounded - amount;
    return { rounded, diff };
}

export function validateGSTIN(gstin: string): boolean {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gstin);
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount);
}
