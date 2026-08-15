'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { LayoutDashboard, School, ArrowLeft, Menu, X } from 'lucide-react';

interface AdminSidebarWrapperProps {
  userEmail: string;
  children: React.ReactNode;
}

export default function AdminSidebarWrapper({ userEmail, children }: AdminSidebarWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
            <Image src="/logo.png" alt="CamTime Logo" width={32} height={32} />
          </div>
          <div>
            <h2 className="font-extrabold text-xs tracking-wide text-white">CamTime ADMIN</h2>
            <p className="text-[10px] text-slate-400">Neurivex Group SaaS</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <aside className="relative w-72 max-w-[80vw] bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 z-50">
            <div>
              <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                    <Image src="/logo.png" alt="CamTime Logo" width={32} height={32} />
                  </div>
                  <span className="font-bold text-xs text-white">CamTime SUPER ADMIN</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  Platform Overview
                </Link>

                <Link
                  href="/admin/schools"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <School className="w-4 h-4 text-blue-400" />
                  School Tenants
                </Link>
              </nav>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <Link
                href="/school"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors text-xs font-medium border border-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                Switch to School App
              </Link>

              <div className="px-1 text-[11px]">
                <p className="text-slate-500">Logged in as:</p>
                <p className="text-slate-300 font-semibold truncate">{userEmail}</p>
              </div>

              {/* Company Branding Footer */}
              <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-slate-800/60">
                <span>Powered by </span>
                <span className="font-bold text-slate-400">Neurivex Group</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 p-6 flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between gap-3 mb-8 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950 flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Image src="/logo.png" alt="CamTime Logo" width={40} height={40} className="object-cover" />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-extrabold text-sm tracking-wide text-white">CamTime</h2>
                <p className="text-[11px] font-bold text-blue-400">SUPER ADMIN</p>
              </div>
            </div>

            <ThemeToggle />
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              Platform Overview
            </Link>

            <Link
              href="/admin/schools"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <School className="w-4 h-4 text-blue-400" />
              School Tenants
            </Link>
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <Link
            href="/school"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors text-xs font-medium border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            Switch to School App
          </Link>

          <div className="px-1 text-[11px]">
            <p className="text-slate-500">Logged in as:</p>
            <p className="text-slate-300 font-semibold truncate">{userEmail}</p>
          </div>

          {/* Company Branding Footer */}
          <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-slate-800/60">
            <span>Powered by </span>
            <span className="font-bold text-slate-400">Neurivex Group</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
