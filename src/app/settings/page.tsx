'use client';

import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Settings } from '@/lib/db';
import { Save, Store, MapPin, Phone, Hash, Receipt, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
    const [formData, setFormData] = useState<Partial<Settings>>({
        shopName: '',
        shopAddress: '',
        shopPhone: '',
        shopGstin: '',
        shopState: '',
        isGstEnabled: true,
        invoicePrefix: 'INV',
        nextInvoiceNumber: 1
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const settings = useLiveQuery(() => db.settings.toArray());

    useEffect(() => {
        if (settings && settings.length > 0) {
            setFormData(settings[0]);
        }
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            if (settings && settings.length > 0) {
                await db.settings.update(settings[0].id!, formData);
            } else {
                await db.settings.add(formData as Settings);
            }
            setMessage({ text: 'Settings saved successfully!', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Failed to save settings.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Settings</h1>
                <p className="text-muted-foreground mt-1 text-lg">Configure your shop profile and billing preferences.</p>
            </header>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Shop Profile */}
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-card border rounded-2xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Store size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Shop Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-muted-foreground">Shop Name</label>
                                <div className="relative group">
                                    <input
                                        required
                                        type="text"
                                        value={formData.shopName}
                                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                        className="w-full h-12 pl-4 pr-4 rounded-xl border bg-background focus:border-primary outline-none transition-all font-medium text-lg"
                                        placeholder="e.g. Acme Supplies"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-muted-foreground">Shop Address</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.shopAddress}
                                    onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                                    className="w-full p-4 rounded-xl border bg-background focus:border-primary outline-none transition-all text-sm resize-none"
                                    placeholder="Street, City, Zip Code"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Phone Number</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        value={formData.shopPhone}
                                        onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
                                        className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background focus:border-primary outline-none transition-all text-sm font-medium"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">GST State</label>
                                <input
                                    type="text"
                                    value={formData.shopState}
                                    onChange={(e) => setFormData({ ...formData, shopState: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border bg-background focus:border-primary outline-none transition-all text-sm font-medium"
                                    placeholder="e.g. Maharashtra"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-card border rounded-2xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                <Receipt size={20} />
                            </div>
                            <h2 className="text-xl font-bold">GST & Billing</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-dashed">
                                <div className="space-y-0.5">
                                    <p className="font-bold">Enable GST Billing</p>
                                    <p className="text-xs text-muted-foreground">Automatically calculate CGST/SGST on invoices</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isGstEnabled: !formData.isGstEnabled })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isGstEnabled ? 'bg-primary' : 'bg-muted'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isGstEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {formData.isGstEnabled && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-semibold text-muted-foreground">GSTIN Number</label>
                                    <div className="relative">
                                        <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={formData.shopGstin}
                                            onChange={(e) => setFormData({ ...formData, shopGstin: e.target.value.toUpperCase() })}
                                            className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background focus:border-primary outline-none transition-all text-sm font-mono tracking-widest uppercase"
                                            placeholder="27AAAAA0000A1Z5"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Invoice Config */}
                <div className="space-y-6">
                    <section className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold text-lg">Invoice Sequence</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prefix</label>
                                <input
                                    type="text"
                                    value={formData.invoicePrefix}
                                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value.toUpperCase() })}
                                    className="w-full h-11 px-4 rounded-xl border bg-background focus:border-primary outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Starting No.</label>
                                <input
                                    type="number"
                                    value={formData.nextInvoiceNumber}
                                    onChange={(e) => setFormData({ ...formData, nextInvoiceNumber: Number(e.target.value) })}
                                    className="w-full h-11 px-4 rounded-xl border bg-background focus:border-primary outline-none transition-all font-mono"
                                />
                            </div>
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <p className="text-xs text-muted-foreground mb-1">Preview Format</p>
                                <p className="font-black text-primary">
                                    {formData.invoicePrefix}-{formData.nextInvoiceNumber?.toString().padStart(4, '0')}
                                </p>
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? 'Saving...' : (
                            <>
                                <Save size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
