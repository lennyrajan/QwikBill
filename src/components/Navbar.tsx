'use client';

import React from 'react';
import { Menu, Bell, User, Settings as SettingsIcon } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 md:px-6">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                        Q
                    </div>
                    <span>QuikBill</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <button className="p-2 rounded-full hover:bg-muted relative">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                    </button>
                    <div className="flex items-center gap-2 pl-2 border-l">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <User size={18} />
                        </div>
                        <div className="hidden md:block text-sm">
                            <p className="font-medium leading-none">Admin</p>
                            <p className="text-xs text-muted-foreground">Shop Owner</p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
