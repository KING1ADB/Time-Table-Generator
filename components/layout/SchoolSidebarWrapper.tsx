'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import {
  LayoutDashboard,
  Settings,
  School as SchoolIcon,
  BookOpen,
  Users,
  ClipboardList,
  Calendar,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/school', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/school/setup', label: 'Operating Hours & Breaks', icon: Settings },
  { href: '/school/classes', label: 'Classes & Arms', icon: SchoolIcon },
  { href: '/school/subjects-rooms', label: 'Subjects & Rooms', icon: BookOpen },
  { href: '/school/teachers', label: 'Teachers & Availability', icon: Users },
  { href: '/school/assignments', label: 'Teaching Assignments', icon: ClipboardList },
  { href: '/school/timetable', label: 'Generated Timetable', icon: Calendar },
];

interface SchoolSidebarWrapperProps {
  schoolName: string;
  schoolType: string;
  userEmail: string;
  children: React.ReactNode;
}

export default function SchoolSidebarWrapper({
  schoolName,
  schoolType,
  userEmail,
  children,
}: SchoolSidebarWrapperProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const activeNavItem = navItems.find((item) => item.href === pathname) || navItems[0];

  function handleSignOut() {
    signOut({ callbackUrl: '/' });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950 flex items-center justify-center">
            <Image src="/logo.png" alt="CamTime Logo" width={36} height={36} className="object-cover" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-white tracking-wide">CamTime</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold glow-emerald-active">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeNavItem.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate" title={schoolName}>
              {schoolName}
            </p>
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[80vw] bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 z-50 animate-slideRight">
            <div>
              <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                    <Image src="/logo.png" alt="CamTime Logo" width={32} height={32} />
                  </div>
                  <div>
                    <h1 className="font-extrabold text-xs text-white tracking-tight">CamTime</h1>
                    <p className="text-[10px] text-slate-400 truncate">{schoolName}</p>
                  </div>
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
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/25 via-emerald-500/15 to-transparent border border-emerald-500/50 text-white glow-emerald-active'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-emerald-400/80'}`} />
                        <span>{item.label}</span>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400 animate-ping" />
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div className="px-2 space-y-1">
                <span className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[10px]">
                  {schoolType} Subsystem
                </span>
                <p className="text-slate-500 text-[10px] pt-1">Logged in user:</p>
                <p className="font-semibold text-white truncate">{userEmail}</p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors text-xs font-semibold border border-slate-800"
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
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between p-4 shrink-0">
        <div>
          {/* Header Logo */}
          <div className="flex items-center justify-between px-2 py-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <Image src="/logo.png" alt="CamTime Logo" width={40} height={40} className="object-cover" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm text-white tracking-tight">CamTime</h1>
                </div>
                <p className="text-xs text-slate-400 truncate" title={schoolName}>
                  {schoolName}
                </p>
              </div>
            </div>

            <ThemeToggle />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/25 via-emerald-500/15 to-transparent border border-emerald-500/50 text-white glow-emerald-active'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-emerald-400/80'}`} />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400 animate-ping" />
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="px-2 space-y-1">
            <span className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[10px]">
              {schoolType} Subsystem
            </span>
            <p className="text-slate-500 text-[10px] pt-1">Logged in user:</p>
            <p className="font-semibold text-white truncate">{userEmail}</p>
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {/* Active Page Header Shining Banner */}
        <div className="mb-6 flex items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              {React.createElement(activeNavItem.icon, { className: 'w-4 h-4' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Active Section:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold tracking-wide glow-emerald-active">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
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
