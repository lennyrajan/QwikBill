import Dexie, { type Table } from 'dexie';

export interface Product {
    id?: number;
    name: string;
    sku: string;
    category: string;
    basePrice: number;
    sellingPrice: number;
    hsnCode: string;
    taxSlab: number; // e.g., 0, 5, 12, 18, 28
    stock: number;
    lastUpdated: number;
}

export interface InvoiceItem {
    productId: number;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    taxSlab: number;
    hsnCode: string;
    total: number;
    taxAmount: number;
}

export interface CustomerData {
    name: string;
    phone: string;
    address?: string;
    gstin?: string;
    state: string;
}

export interface Invoice {
    id?: number;
    invoiceNumber: string;
    date: number;
    customer: CustomerData;
    items: InvoiceItem[];
    subtotal: number;
    totalTax: number;
    rounding: number;
    totalAmount: number;
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    type: 'Tax Invoice' | 'Bill of Supply';
    isInterState: boolean;
    syncStatus: 'local' | 'synced' | 'pending';
}

export interface Settings {
    id?: number;
    shopName: string;
    shopAddress: string;
    shopPhone: string;
    shopGstin: string;
    shopState: string;
    isGstEnabled: boolean;
    invoicePrefix: string;
    nextInvoiceNumber: number;
}

export class QuikBillDB extends Dexie {
    products!: Table<Product>;
    invoices!: Table<Invoice>;
    settings!: Table<Settings>;

    constructor() {
        super('QuikBillDB');
        this.version(1).stores({
            products: '++id, name, sku, category, hsnCode',
            invoices: '++id, invoiceNumber, date, paymentStatus, type, syncStatus',
            settings: '++id'
        });
    }
}

export const db = new QuikBillDB();
