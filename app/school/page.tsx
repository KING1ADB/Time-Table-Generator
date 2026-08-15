import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { getSchoolDataPreValidation } from '@/lib/actions/schoolActions';
import {
  School,
  Users,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Settings,
} from 'lucide-react';

export default async function SchoolDashboardPage() {
  const school = await prisma.school.findFirst({
    where: { code: 'MBOA-01' },
  });

  const schoolId = school?.id || '';

  const [preValidation, counts] = await Promise.all([
    getSchoolDataPreValidation(schoolId),
    prisma.$transaction([
      prisma.class.count({ where: { schoolId } }),
      prisma.teacher.count({ where: { schoolId } }),
      prisma.subject.count({ where: { schoolId } }),
      prisma.teachingAssignment.count({ where: { schoolId } }),
    ]),
  ]);

  const [classCount, teacherCount, subjectCount, assignmentCount] = counts;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">School Administration Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Manage master data, setup schedules, and configure teaching assignments for automatic timetable generation.
        </p>
      </div>

      {/* Pre-Validation Banner */}
      <div
        className={`p-6 rounded-xl border ${
          preValidation.isValid
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
        }`}
      >
        <div className="flex items-start gap-4">
          {preValidation.isValid ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-2 flex-1">
            <h2 className="text-lg font-bold text-white">
              Pre-Validation Status:{' '}
              {preValidation.isValid ? (
                <span className="text-emerald-400">VALID — Ready for Engine Execution</span>
              ) : (
                <span className="text-amber-400">ATTENTION REQUIRED</span>
              )}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-xs">Total Sections</span>
                <span className="text-lg font-bold text-white">{preValidation.totalClassSections}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-xs">Weekly Slot Capacity</span>
                <span className="text-lg font-bold text-white">{preValidation.totalAvailableSlotCapacity}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-xs">Assigned Periods</span>
                <span className="text-lg font-bold text-white">{preValidation.totalAssignedPeriods}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-xs">Operating Days</span>
                <span className="text-lg font-bold text-white">{preValidation.numDays} Days/wk</span>
              </div>
            </div>

            {preValidation.warnings.length > 0 && (
              <div className="space-y-1 pt-2">
                {preValidation.warnings.map((w, idx) => (
                  <p key={idx} className="text-xs text-amber-300 font-medium">
                    {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/school/classes"
          className="p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <School className="w-6 h-6 text-emerald-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-white">{classCount}</p>
          <p className="text-xs text-slate-400 mt-1">Classes Configured</p>
        </Link>

        <Link
          href="/school/teachers"
          className="p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <Users className="w-6 h-6 text-emerald-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-white">{teacherCount}</p>
          <p className="text-xs text-slate-400 mt-1">Teachers Registered</p>
        </Link>

        <Link
          href="/school/subjects-rooms"
          className="p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-white">{subjectCount}</p>
          <p className="text-xs text-slate-400 mt-1">Subjects & Labs</p>
        </Link>

        <Link
          href="/school/assignments"
          className="p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <ClipboardList className="w-6 h-6 text-emerald-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-white">{assignmentCount}</p>
          <p className="text-xs text-slate-400 mt-1">Teaching Assignments</p>
        </Link>
      </div>

      {/* Quick Setup Workflow Links */}
      <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Setup Checklist & Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/school/setup"
            className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center justify-between group"
          >
            <div>
              <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                1. Configure Operating Hours & Breaks
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Set opening/closing times, period lengths (50/55m), and lunch breaks.
              </p>
            </div>
            <Settings className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-2" />
          </Link>

          <Link
            href="/school/assignments"
            className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center justify-between group"
          >
            <div>
              <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                2. Decoupled Teaching Assignments
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Assign teachers to class sections and set weekly required periods.
              </p>
            </div>
            <ClipboardList className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
