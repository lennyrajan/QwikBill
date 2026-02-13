'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product, type InvoiceItem, type Invoice } from '@/lib/db';
import { calculateLineItem, roundToNearestRupee, formatCurrency } from '@/lib/billing-utils';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Receipt,
    User,
    Calculator,
    ArrowRight,
    Package,
    CheckCircle2,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BillingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<InvoiceItem[]>([]);
    const [customer, setCustomer] = useState({ name: '', phone: '', state: 'Shop State' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastInvoiceId, setLastInvoiceId] = useState<number | null>(null);

    // Load products and settings
    const products = useLiveQuery(
        () => {
            if (!searchTerm) return [];
            return db.products
                .filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .limit(5)
                .toArray();
        },
        [searchTerm]
    );

    const settings = useLiveQuery(() => db.settings.toArray());

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            updateQuantity(product.id!, existing.quantity + 1);
        } else {
            const calc = calculateLineItem(product.sellingPrice, 1, product.taxSlab);
            const newItem: InvoiceItem = {
                productId: product.id!,
                name: product.name,
                sku: product.sku,
                price: product.sellingPrice,
                quantity: 1,
                taxSlab: product.taxSlab,
                hsnCode: product.hsnCode,
                taxAmount: calc.taxAmount,
                total: calc.itemTotal
            };
            setCart([...cart, newItem]);
        }
        setSearchTerm(''); // Clear search after adding
    };

    const updateQuantity = (productId: number, newQty: number) => {
        if (newQty < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const calc = calculateLineItem(item.price, newQty, item.taxSlab);
                return {
                    ...item,
                    quantity: newQty,
                    taxAmount: calc.taxAmount,
                    total: calc.itemTotal
                };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    // Calculations
    const { subtotal, totalTax, grandTotal, rounding, finalTotal } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = cart.reduce((acc, item) => acc + item.taxAmount, 0);
        const total = sub + tax;
        const { rounded, diff } = roundToNearestRupee(total);

        return {
            subtotal: sub,
            totalTax: tax,
            grandTotal: total,
            rounding: diff,
            finalTotal: rounded
        };
    }, [cart]);

    const handleGenerateInvoice = async () => {
        if (!settings || settings.length === 0) {
            alert('Please configure shop settings first!');
            return;
        }
        if (cart.length === 0) {
            alert('Cart is empty. Add items to generate an invoice.');
            return;
        }

        setIsProcessing(true);
        const shopSettings = settings[0];

        try {
            const invoiceNumber = `${shopSettings.invoicePrefix}-${shopSettings.nextInvoiceNumber.toString().padStart(4, '0')}`;

            const invoiceData: Invoice = {
                invoiceNumber,
                date: Date.now(),
                customer: {
                    ...customer,
                    state: customer.state || shopSettings.shopState
                },
                items: cart,
                subtotal,
                totalTax,
                rounding,
                totalAmount: finalTotal,
                paymentStatus: 'Paid',
                type: shopSettings.isGstEnabled ? 'Tax Invoice' : 'Bill of Supply',
                isInterState: customer.state !== shopSettings.shopState,
                syncStatus: 'local'
            };

            // 1. Save Invoice
            const id = await db.invoices.add(invoiceData);

            // 2. Update Invoice Number in Settings
            await db.settings.update(shopSettings.id!, {
                nextInvoiceNumber: shopSettings.nextInvoiceNumber + 1
            });

            // 3. Generate PDF
            await generateInvoicePDF(invoiceData, shopSettings);

            setLastInvoiceId(id as number);
            setCart([]); // Clear cart
            setCustomer({ name: '', phone: '', state: shopSettings.shopState });
        } catch (error) {
            console.error('Invoice Generation Failed:', error);
            alert('Failed to generate invoice. Check console for details.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (lastInvoiceId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">Invoice Generated!</h1>
                    <p className="text-muted-foreground text-lg">The document has been saved locally and downloaded.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setLastInvoiceId(null)}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all"
                    >
                        New Checkout
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/90 transition-all flex items-center gap-2"
                    >
                        <FileText size={20} />
                        View Print
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
            {/* Left Column: Search & Cart */}
            <div className="xl:col-span-2 space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                    <p className="text-muted-foreground mt-1">Select items and manage the customer cart.</p>
                </header>

                {/* Item Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Scan barcode or type product name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg font-medium shadow-sm"
                    />

                    {/* Search Dropdown */}
                    {searchTerm && products && products.length > 0 && (
                        <div className="absolute z-50 top-full mt-2 w-full bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                            <div className="p-2">
                                {products.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => addToCart(p)}
                                        className="w-full flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors text-left group/item"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                                            <Package size={20} className="group-hover/item:text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">SKU: {p.sku} | Price: {formatCurrency(p.sellingPrice)}</p>
                                        </div>
                                        <div className="text-primary opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <Plus size={20} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Cart View */}
                <div className="rounded-2xl border bg-card flex flex-col h-[600px] shadow-sm relative overflow-hidden">
                    <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={18} className="text-primary" />
                            <h2 className="font-bold">Current Cart ({cart.length} items)</h2>
                        </div>
                        {cart.length > 0 && (
                            <button
                                onClick={() => setCart([])}
                                className="text-xs font-semibold text-destructive hover:underline"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                                <Receipt size={64} strokeWidth={1} />
                                <p className="font-medium text-lg">Your cart is empty</p>
                                <p className="text-sm">Search for products above to start billing.</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.productId} className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/20 transition-all group">
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(item.price)} x {item.quantity} | GST {item.taxSlab}%
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-secondary/50 p-1 rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <div className="text-right min-w-[100px]">
                                        <p className="font-black text-lg">{formatCurrency(item.total)}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Incl. Tax</p>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Customer & Summary */}
            <div className="space-y-6">
                {/* Customer Details */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <div className="flex items-center gap-2 mb-2">
                        <User size={18} className="text-primary" />
                        <h2 className="font-bold">Customer Details</h2>
                    </div>
                    <div className="space-y-3 relative z-10">
                        <input
                            type="text"
                            placeholder="Customer Name"
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:border-primary outline-none transition-all text-sm"
                            value={customer.name}
                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:border-primary outline-none transition-all text-sm"
                            value={customer.phone}
                            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        />
                    </div>
                </div>

                {/* Totals Summary */}
                <div className="rounded-2xl border bg-card overflow-hidden shadow-lg border-primary/10">
                    <div className="p-6 bg-primary/5 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                            <Calculator size={18} className="text-primary" />
                            <h2 className="font-bold text-primary">Bill Summary</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total GST</span>
                                <span className="font-medium text-blue-600">+{formatCurrency(totalTax)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t">
                                <span className="text-muted-foreground">Gross Total</span>
                                <span className="font-bold">{formatCurrency(grandTotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs italic">
                                <span className="text-muted-foreground">Rounding</span>
                                <span className={rounding >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {rounding >= 0 ? '+' : ''}{rounding.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-dashed flex justify-between items-end">
                            <div>
                                <p className="text-sm font-bold text-primary uppercase tracking-wider">Total Payable</p>
                                <p className="text-4xl font-black">{formatCurrency(finalTotal)}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateInvoice}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full group relative flex items-center justify-center gap-2 h-14 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:shadow-none mt-4"
                        >
                            {isProcessing ? 'Generating...' : (
                                <>
                                    Generate Invoice
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
