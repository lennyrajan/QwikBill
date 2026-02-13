'use client';

import React, { useState } from 'react';
import { db, type Product } from '@/lib/db';
import { GST_SLABS } from '@/lib/billing-utils';
import { Package, X, Save, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFormProps {
    product?: Product;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const [formData, setFormData] = useState<Partial<Product>>(
        product || {
            name: '',
            sku: '',
            category: 'General',
            basePrice: 0,
            sellingPrice: 0,
            hsnCode: '',
            taxSlab: 18,
            stock: 0,
        }
    );

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                lastUpdated: Date.now(),
            } as Product;

            if (product?.id) {
                await db.products.update(product.id, dataToSave);
            } else {
                await db.products.add(dataToSave);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save product:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-card border rounded-2xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Package size={20} />
                    </div>
                    <h2 className="font-bold text-lg">{product ? 'Edit Product' : 'Add New Product'}</h2>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Product Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. Wireless Mouse"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">SKU / Item Code</label>
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. WM-001"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">HSN/SAC Code</label>
                        <input
                            required
                            type="text"
                            value={formData.hsnCode}
                            onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Mandatory for GST"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tax Slab (%)</label>
                        <select
                            value={formData.taxSlab}
                            onChange={(e) => setFormData({ ...formData, taxSlab: Number(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                            {GST_SLABS.map((slab) => (
                                <option key={slab} value={slab}>
                                    {slab}%
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Selling Price (₹)</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            value={formData.sellingPrice}
                            onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Base/Purchase Price (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Initial Stock</label>
                        <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isSaving}
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Product
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
