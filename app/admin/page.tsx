import Link from 'next/link';
import { getPlatformMetricsAction } from '@/lib/actions/superAdminActions';
import { School, Users, Zap, CheckCircle2, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function AdminDashboardPage() {
  const metrics = await getPlatformMetricsAction();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Administration & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Multi-tenant SaaS platform infrastructure metrics & tenant provisioning
          </p>
        </div>

        <Link
          href="/admin/schools"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-950/40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Provision New School Tenant
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <School className="w-6 h-6 text-blue-400" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Tenants
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">{metrics.totalSchools}</p>
            <p className="text-xs text-slate-400 mt-1">Total Provisioned Schools</p>
          </div>
        </div>

        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Active
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">{metrics.activeSchools}</p>
            <p className="text-xs text-slate-400 mt-1">Active Subscriptions</p>
          </div>
        </div>

        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <Users className="w-6 h-6 text-indigo-400" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Faculty
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">{metrics.totalTeachers}</p>
            <p className="text-xs text-slate-400 mt-1">Total Registered Teachers</p>
          </div>
        </div>

        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <Zap className="w-6 h-6 text-amber-400" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              CP-SAT
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">{metrics.totalTimetables}</p>
            <p className="text-xs text-slate-400 mt-1">Generated Timetables</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Card */}
      <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">School Tenant Management</h3>
              <p className="text-xs text-slate-400">
                Provision new school accounts, configure subsystems (Grammar, Technical, Bilingual), and manage tenant subscriptions.
              </p>
            </div>
          </div>

          <Link
            href="/admin/schools"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors group shrink-0"
          >
            Manage School Tenants
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
