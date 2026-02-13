'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '@/lib/db';
import { ProductForm } from '@/components/ProductForm';
import {
    Package,
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    MoreVertical,
    ChevronDown
} from 'lucide-react';
import { formatCurrency } from '@/lib/billing-utils';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | undefined>();

    const products = useLiveQuery(
        () => {
            if (!searchTerm) return db.products.toArray();
            return db.products
                .filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .toArray();
        },
        [searchTerm]
    );

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await db.products.delete(id);
        }
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your inventory and tax settings.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingProduct(undefined);
                            setShowForm(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                )}
            </header>

            {showForm ? (
                <div className="max-w-4xl mx-auto">
                    <ProductForm
                        product={editingProduct}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditingProduct(undefined);
                        }}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingProduct(undefined);
                        }}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 rounded-xl border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl border bg-card hover:bg-muted transition-colors font-medium">
                            <Filter size={18} />
                            Filters
                            <ChevronDown size={14} className="opacity-50" />
                        </button>
                    </div>

                    {/* Products Table */}
                    <div className="rounded-2xl border bg-card overflow-hidden card-shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">HSN</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tax</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {products?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2 opacity-60">
                                                    <Package size={40} strokeWidth={1.5} />
                                                    <p>No products found Matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        products?.map((product) => (
                                            <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-foreground">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">{product.hsnCode}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {product.taxSlab}% GST
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-foreground">
                                                    {formatCurrency(product.sellingPrice)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => startEdit(product)}
                                                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => product.id && handleDelete(product.id)}
                                                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
