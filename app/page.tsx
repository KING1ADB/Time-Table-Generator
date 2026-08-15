import Link from 'next/link';
import { Sparkles, Calendar, ShieldCheck, Cpu, Printer, Lock, ArrowRight, CheckCircle2, School } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wide text-white">MINESEC Timetable</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              SaaS Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
          >
            School Portal Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-blue-400 font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Google OR-Tools CP-SAT Constraint Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
          Automated Secondary School <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
            Timetable Generation System
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Tailored specifically for Cameroonian secondary schools (Anglophone & Francophone subsystems). Generate 100% conflict-free timetables in seconds, manually edit with live diagnostic conflict warnings, lock custom lessons (🔒), and export high-resolution A3/A2 landscape noticeboard PDFs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-3"
          >
            Access School Portal <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Cameroonian Schools</h2>
          <p className="text-slate-400 text-sm mt-2">
            Everything school administrators need to manage complex multi-stream schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated CP-SAT Solver</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Calculates 100% conflict-free timetables across teachers, classes, labs, and availability matrices in under 1 second.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Manual Editor & Locking (🔒)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Drag-and-drop slots with real-time conflict diagnostics. Freeze key sessions in place while regenerating surrounding slots.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Vector A3 / A2 PDF Exports</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Print official Cameroonian MINESEC formatted timetables for noticeboards, staffrooms, and administrative office binders.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
