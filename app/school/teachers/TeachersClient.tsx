'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTeacher, updateTeacherAvailability, deleteTeacher } from '@/lib/actions/schoolActions';
import { Users, Plus, Trash2, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';

interface TeacherItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  maxPerDay: number;
  availability: { id: string; day: string; isAvailable: boolean }[];
}

const DAYS_LIST = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function TeachersClient({
  initialTeachers,
  schoolId,
}: {
  initialTeachers: TeacherItem[];
  schoolId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [maxPerDay, setMaxPerDay] = useState(6);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const res = await createTeacher(schoolId, {
          name,
          email,
          phone,
          maxPerDay: Number(maxPerDay),
        });

        if (res.success) {
          setMessage({ type: 'success', text: `Teacher "${name}" registered successfully.` });
          setName('');
          setEmail('');
          setPhone('');
          setMaxPerDay(6);
          router.refresh();
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to create teacher.' });
      }
    });
  }

  function handleToggleAvailability(teacherId: string, day: string, currentStatus: boolean) {
    startTransition(async () => {
      try {
        await updateTeacherAvailability(teacherId, { [day]: !currentStatus });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to update availability.' });
      }
    });
  }

  function handleDelete(id: string, teacherName: string) {
    if (!confirm(`Delete teacher "${teacherName}"?`)) return;

    startTransition(async () => {
      try {
        await deleteTeacher(id);
        setMessage({ type: 'success', text: `Teacher "${teacherName}" deleted.` });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to delete teacher.' });
      }
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Teachers & Weekly Availability</h1>
        <p className="text-slate-400 mt-1">
          Register teaching staff and set day-by-day availability constraints.
        </p>
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
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleCreate} className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          Register New Teacher
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mr. Fonsah Paul"
              required
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fonsah@mboacollege.cm"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 670000000"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Max Periods / Day</label>
            <input
              type="number"
              value={maxPerDay}
              onChange={(e) => setMaxPerDay(Number(e.target.value))}
              min={1}
              max={10}
              required
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors shadow-md shadow-emerald-950/40 disabled:opacity-50"
        >
          {isPending ? 'Registering Teacher...' : 'Register Teacher'}
        </button>
      </form>

      {/* Teachers Registry & Availability Grid */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Teachers & Availability Registry ({initialTeachers.length})
          </h3>
        </div>

        {initialTeachers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No teachers registered yet. Add a teacher above.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {initialTeachers.map((t) => (
              <div key={t.id} className="p-4 space-y-3 hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{t.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.email || 'No email'} • {t.phone || 'No phone'} • Max {t.maxPerDay} periods/day
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id, t.name)}
                    disabled={isPending}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Day-by-Day Interactive Availability Toggles */}
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 text-emerald-400" /> Weekly Day Availability (Click to Toggle)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_LIST.map((day) => {
                      const availObj = t.availability.find((a) => a.day === day);
                      const isAvailable = availObj ? availObj.isAvailable : true;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleAvailability(t.id, day, isAvailable)}
                          disabled={isPending}
                          className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                            isAvailable
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 line-through'
                          }`}
                        >
                          {day.substring(0, 3)}: {isAvailable ? 'ON' : 'OFF'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
