'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Receipt,
    Users,
    Settings,
    BarChart3,
    CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Billing', href: '/billing', icon: Receipt },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Ledger', href: '/ledger', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 border-r bg-card h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>
            <div className="mt-auto p-4 border-t">
                <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Status</p>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Local Sync Ready</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
