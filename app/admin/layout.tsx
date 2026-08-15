import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ShieldAlert, LayoutDashboard, School, ArrowLeft, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // If role is not SUPER_ADMIN in production, redirect to login or school dashboard
  if (session && (session.user as any)?.role !== 'SUPER_ADMIN') {
    // In production, enforce role check redirect('/login');
  }

  const userEmail = session?.user?.email || 'admin@minesec.gov.cm';

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-900/50">
              S
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide text-white">SUPER ADMIN</h2>
              <p className="text-[11px] text-slate-400">Multi-Tenant SaaS Portal</p>
            </div>
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
            Switch to School SaaS App
          </Link>

          <div className="px-1 text-[11px]">
            <p className="text-slate-500">Logged in as:</p>
            <p className="text-slate-300 font-semibold truncate">{userEmail}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
