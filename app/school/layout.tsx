import Link from 'next/link';
import {
  LayoutDashboard,
  Settings,
  School,
  BookOpen,
  Users,
  ClipboardList,
  GraduationCap,
  Calendar,
} from 'lucide-react';

const navItems = [
  { href: '/school', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/school/setup', label: 'Operating Hours & Breaks', icon: Settings },
  { href: '/school/classes', label: 'Classes & Arms', icon: School },
  { href: '/school/subjects-rooms', label: 'Subjects & Rooms', icon: BookOpen },
  { href: '/school/teachers', label: 'Teachers & Availability', icon: Users },
  { href: '/school/assignments', label: 'Teaching Assignments', icon: ClipboardList },
  { href: '/school/timetable', label: 'Generated Timetable', icon: Calendar },
];


export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-wide">Mboa College</h1>
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

        <div className="p-3 bg-slate-850/50 rounded-lg border border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Cameroon Subsystem</p>
          <p className="mt-0.5">MINESEC Anglophone & Francophone</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
