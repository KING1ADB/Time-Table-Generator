'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTeachingAssignment, deleteTeachingAssignment } from '@/lib/actions/schoolActions';
import { ClipboardList, Plus, Trash2, CheckCircle2, AlertTriangle, Search, Clock, Award } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
}

interface ClassSection {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Assignment {
  id: string;
  periodsPerWeek: number;
  allowDoublePeriod: boolean;
  timePreference: string;
  teacher: Teacher;
  classSection: ClassSection;
  subject: Subject;
}

interface PreValidationData {
  isValid: boolean;
  totalClassSections: number;
  totalAvailableSlotCapacity: number;
  totalAssignedPeriods: number;
  numDays: number;
  numPeriodsPerDay: number;
  slotsPerClassPerWeek: number;
  warnings: string[];
}

export default function AssignmentsClient({
  schoolId,
  teachers,
  sections,
  subjects,
  initialAssignments,
  preValidation,
}: {
  schoolId: string;
  teachers: Teacher[];
  sections: ClassSection[];
  subjects: Subject[];
  initialAssignments: Assignment[];
  preValidation: PreValidationData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [teacherId, setTeacherId] = useState('');
  const [classSectionId, setClassSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [periodsPerWeek, setPeriodsPerWeek] = useState(4);
  const [allowDoublePeriod, setAllowDoublePeriod] = useState(true);
  const [timePreference, setTimePreference] = useState<'ANY' | 'MORNING' | 'AFTERNOON'>('ANY');

  const [searchFilter, setSearchFilter] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!teacherId || !classSectionId || !subjectId) {
      setMessage({ type: 'error', text: 'Please select a Teacher, Class Section, and Subject.' });
      return;
    }

    startTransition(async () => {
      try {
        const res = await createTeachingAssignment(schoolId, {
          teacherId,
          classSectionId,
          subjectId,
          periodsPerWeek: Number(periodsPerWeek),
          allowDoublePeriod,
          timePreference,
        });

        if (res.success) {
          setMessage({ type: 'success', text: 'Teaching assignment created successfully!' });
          // Reset form choices except teacher for convenience
          setClassSectionId('');
          setSubjectId('');
          setPeriodsPerWeek(4);
          router.refresh();
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to create assignment.' });
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this teaching assignment?')) return;

    startTransition(async () => {
      try {
        await deleteTeachingAssignment(id);
        setMessage({ type: 'success', text: 'Assignment deleted.' });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to delete assignment.' });
      }
    });
  }

  const filteredAssignments = initialAssignments.filter((a) => {
    const q = searchFilter.toLowerCase();
    return (
      a.teacher.name.toLowerCase().includes(q) ||
      a.classSection.name.toLowerCase().includes(q) ||
      a.subject.name.toLowerCase().includes(q) ||
      a.subject.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Decoupled Teaching Assignments</h1>
        <p className="text-slate-400 mt-1">
          Assign subject workload hours per class section without hardcoding cell-by-cell slots.
        </p>
      </div>

      {/* Pre-Validation Engine Summary Banner */}
      <div
        className={`p-6 rounded-xl border ${
          preValidation.isValid
            ? 'bg-emerald-950/40 border-emerald-500/30'
            : 'bg-amber-950/40 border-amber-500/30'
        }`}
      >
        <div className="flex items-start gap-4">
          {preValidation.isValid ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
          )}

          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Pre-Validation Warning Engine</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  preValidation.isValid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {preValidation.isValid ? '✅ VALID CAPACITY' : '⚠️ WARNING / CAPACITY ISSUE'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Sections</span>
                <span className="text-xl font-bold text-white">{preValidation.totalClassSections} Sections</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">Available Slot Capacity</span>
                <span className="text-xl font-bold text-white">
                  {preValidation.totalAvailableSlotCapacity} Slots ({preValidation.slotsPerClassPerWeek}/sec)
                </span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Assigned Periods</span>
                <span className="text-xl font-bold text-white">{preValidation.totalAssignedPeriods} Periods</span>
              </div>
            </div>

            {preValidation.isValid ? (
              <p className="text-xs text-emerald-300 font-medium">
                ✅ Total required workload ({preValidation.totalAssignedPeriods} periods) fits within operating capacity ({preValidation.totalAvailableSlotCapacity} slots).
              </p>
            ) : (
              <div className="space-y-1 bg-amber-950/60 p-3 rounded-lg border border-amber-500/30">
                {preValidation.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-200 font-medium">
                    {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border border-red-500/40 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Assignment Creation Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          Add Teaching Assignment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Teacher</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Class Section Arm</label>
            <select
              value={classSectionId}
              onChange={(e) => setClassSectionId(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Class Section...</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Subject...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Periods / Week</label>
            <input
              type="number"
              value={periodsPerWeek}
              onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
              min={1}
              max={20}
              required
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Time Preference</label>
            <select
              value={timePreference}
              onChange={(e) => setTimePreference(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="ANY">Any Time</option>
              <option value="MORNING">Morning Preferential</option>
              <option value="AFTERNOON">Afternoon Preferential</option>
            </select>
          </div>

          <div className="pt-5">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={allowDoublePeriod}
                onChange={(e) => setAllowDoublePeriod(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Allow Double Period Blocks (2 consecutive slots)</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors shadow-md shadow-emerald-950/40 disabled:opacity-50"
        >
          {isPending ? 'Creating Assignment...' : 'Save Teaching Assignment'}
        </button>
      </form>

      {/* Assignments Table & Filter */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            Current Workload Assignments ({filteredAssignments.length})
          </h3>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search teacher, class, subject..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No teaching assignments found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Class Section</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Teacher</th>
                  <th className="p-3.5">Weekly Periods</th>
                  <th className="p-3.5">Block / Preference</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 font-bold text-white">{a.classSection.name}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-white">{a.subject.name}</span>{' '}
                      <span className="text-slate-500 font-mono text-[10px]">({a.subject.code})</span>
                    </td>
                    <td className="p-3.5 text-emerald-300 font-medium">{a.teacher.name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded font-bold">
                        {a.periodsPerWeek} periods/wk
                      </span>
                    </td>
                    <td className="p-3.5 space-x-1">
                      {a.allowDoublePeriod && (
                        <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] rounded border border-indigo-500/20">
                          2x Block Allowed
                        </span>
                      )}
                      {a.timePreference !== 'ANY' && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] rounded border border-amber-500/20">
                          {a.timePreference}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        disabled={isPending}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
