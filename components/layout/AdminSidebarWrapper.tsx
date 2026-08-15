'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { LayoutDashboard, School, ArrowLeft, Menu, X, Sparkles, LogOut } from 'lucide-react';

const adminNavItems = [
  { href: '/admin', label: 'Platform Overview', icon: LayoutDashboard },
  { href: '/admin/schools', label: 'School Tenants', icon: School },
];

interface AdminSidebarWrapperProps {
  userEmail: string;
  children: React.ReactNode;
}

export default function AdminSidebarWrapper({ userEmail, children }: AdminSidebarWrapperProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const activeNavItem = adminNavItems.find((item) => item.href === pathname) || adminNavItems[0];

  function handleSignOut() {
    signOut({ callbackUrl: '/' });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
            <Image src="/logo.png" alt="CamTime Logo" width={32} height={32} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-xs tracking-wide text-white">CamTime ADMIN</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold glow-blue-active">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {activeNavItem.label}
              </span>
            </div>
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

              <nav className="space-y-1.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/25 via-blue-500/15 to-transparent border border-blue-500/50 text-white glow-blue-active'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400 animate-pulse' : 'text-blue-400/80'}`} />
                        <span>{item.label}</span>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-400 shadow-md shadow-blue-400 animate-ping" />
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                      )}
                    </Link>
                  );
                })}
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

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors text-xs font-semibold border border-slate-800 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                Sign Out
              </button>

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
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/25 via-blue-500/15 to-transparent border border-blue-500/50 text-white glow-blue-active'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400 animate-pulse' : 'text-blue-400/80'}`} />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shadow-md shadow-blue-400 animate-ping" />
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  )}
                </Link>
              );
            })}
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

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors text-xs font-semibold border border-slate-800 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            Sign Out
          </button>

          {/* Company Branding Footer */}
          <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-slate-800/60">
            <span>Powered by </span>
            <span className="font-bold text-slate-400">Neurivex Group</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Active Page Header Shining Banner */}
        <div className="mb-6 flex items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
              {React.createElement(activeNavItem.icon, { className: 'w-4 h-4' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Active Admin Section:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-extrabold tracking-wide glow-blue-active">
                  <Sparkles className="w-3 h-3 text-blue-400 animate-spin" />
                  {activeNavItem.label.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
