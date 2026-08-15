import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/theme/ThemeToggle';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Printer,
  Lock,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Zap,
} from 'lucide-react';

const WHATSAPP_NUMBER = '237654087582';
const WHATSAPP_ANNUAL_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Neurivex%20Group!%20I%20want%20to%20subscribe%20my%20school%20to%20CamTime%20(Annual%20Plan%20-%205,000%20FCFA).`;
const WHATSAPP_LIFETIME_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Neurivex%20Group!%20I%20want%20to%20subscribe%20my%20school%20to%20CamTime%20(Lifetime%20VIP%20Plan%20-%2050,000%20FCFA).`;

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
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Image src="/logo.png" alt="CamTime Logo" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">CamTime</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Powered by Neurivex Group</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
          >
            School Portal Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-blue-400 font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Google OR-Tools CP-SAT Constraint Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
          CamTime — Secondary School <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
            Timetable Generation System
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          CamTime by <strong>Neurivex Group</strong> simplifies secondary school scheduling with CP-SAT constraint satisfaction, decoupled teaching assignments, and official MINESEC vector PDF exports.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            Access CamTime Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href={WHATSAPP_ANNUAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-5 h-5" /> Subscribe on WhatsApp (+237 654087582)
          </a>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated CP-SAT Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Google OR-Tools solver resolves room labs, period capacities, and teacher daily workload limits in seconds.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Manual Drag & Slot Lock</h3>
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
              Print official Cameroonian MINESEC formatted timetables with CamTime branding & Neurivex Group attributions for noticeboards.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Tiers */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            Subscription Pricing
          </span>
          <h2 className="text-3xl font-black text-white mt-3">Simple, Affordable Pricing for Cameroon Schools</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Get full access to the CamTime timetable generator. Instant activation via Mobile Money & Orange Money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tier 1: 5,000 FCFA / Academic Year */}
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 relative flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-xl">
            <div>
              <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase">
                Annual Plan
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">5,000 FCFA</span>
                <span className="text-slate-400 text-sm">/ Academic Year</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Ideal for individual Cameroonian secondary schools for one full academic year.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Class Streams & Single-Arm Forms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full CP-SAT Solver & Guided Slot Allocator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Class, Teacher & Institutional Master PDF Exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>MTN Mobile Money & Orange Money Support</span>
                </li>
              </ul>
            </div>

            <a
              href={WHATSAPP_ANNUAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-sm text-center shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Subscribe for 5,000 FCFA on WhatsApp
            </a>
          </div>

          {/* Tier 2: 50,000 FCFA / Lifetime Access */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/40 relative flex flex-col justify-between hover:border-indigo-400 transition-all shadow-2xl glow-blue-active">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-black tracking-wider uppercase shadow-md">
              Best Value • Lifetime Access
            </div>

            <div>
              <span className="px-3 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase">
                Lifetime Plan
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">50,000 FCFA</span>
                <span className="text-slate-400 text-sm">/ Lifetime License</span>
              </div>
              <p className="text-xs text-indigo-200 mt-2">
                One-time payment for permanent unlimited lifetime access for your institution.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Permanent Unlimited Lifetime Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Priority CP-SAT Solver Server Allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Dedicated Support by Neurivex Group Engineers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Free Future Updates & Subsystem Enhancements</span>
                </li>
              </ul>
            </div>

            <a
              href={WHATSAPP_LIFETIME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm text-center shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" /> Get Lifetime Plan (50,000 FCFA) on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-8 text-center text-xs text-slate-500">
        <p>© 2026 CamTime Timetable Platform • Powered by <strong className="text-slate-400">Neurivex Group</strong></p>
      </footer>
    </div>
  );
}
