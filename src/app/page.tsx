'use client';

import React from 'react';
import {
  TrendingUp,
  Package,
  Receipt,
  Users,
  PlusCircle,
  ShoppingCart,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/billing-utils';

export default function Dashboard() {
  const stats = [
    { name: 'Total Sales (Month)', value: 124500, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Total Invoices', value: 48, icon: Receipt, iconColor: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Inventory Items', value: 156, icon: Package, iconColor: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Active Customers', value: 42, icon: Users, iconColor: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const quickActions = [
    { name: 'Create New Bill', href: '/billing', icon: PlusCircle, color: 'bg-primary' },
    { name: 'Add Product', href: '/products', icon: ShoppingCart, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Business Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening with your shop today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl border bg-card card-shadow relative overflow-hidden group">
            <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-4`}>
              <stat.icon size={24} className={stat.color || stat.iconColor} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <h3 className="text-2xl font-bold">
                {typeof stat.value === 'number' && stat.name.includes('Sales')
                  ? formatCurrency(stat.value)
                  : stat.value}
              </h3>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="text-muted-foreground" size={16} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted transition-all group"
              >
                <div className={`p-3 rounded-lg ${action.color} text-white`}>
                  <action.icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{action.name}</p>
                  <p className="text-xs text-muted-foreground">Go to {action.name.toLowerCase()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Invoices</h2>
            <Link href="/billing" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="p-8 text-center space-y-3">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt size={32} className="text-muted-foreground opacity-50" />
              </div>
              <p className="font-medium">No recent invoices found</p>
              <p className="text-sm text-muted-foreground">Start by creating your first bill to see activity here.</p>
              <Link href="/billing" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                New Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
