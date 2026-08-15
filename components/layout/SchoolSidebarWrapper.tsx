'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Settings,
  School as SchoolIcon,
  BookOpen,
  Users,
  ClipboardList,
  GraduationCap,
  Calendar,
  LogOut,
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-xs text-white tracking-wide truncate" title={schoolName}>
              {schoolName}
            </h1>
            <p className="text-[10px] text-slate-400">Timetable SaaS</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h1 className="font-bold text-xs text-white truncate">{schoolName}</h1>
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
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-emerald-400" />
                      {item.label}
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

              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors text-xs font-semibold border border-slate-800"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                Sign Out
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm text-white tracking-wide truncate" title={schoolName}>
                {schoolName}
              </h1>
              <p className="text-xs text-slate-400">Timetable SaaS</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  {item.label}
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

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors text-xs font-semibold border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
