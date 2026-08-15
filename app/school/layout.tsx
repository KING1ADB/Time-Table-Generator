import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import {
  LayoutDashboard,
  Settings,
  School,
  BookOpen,
  Users,
  ClipboardList,
  GraduationCap,
  Calendar,
  LogOut,
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

export default async function SchoolLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const userEmail = session.user.email || 'school.admin@minesec.gov.cm';

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
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

        <div className="space-y-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="px-2">
            <p className="text-slate-500 text-[10px]">Logged in user:</p>
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
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
