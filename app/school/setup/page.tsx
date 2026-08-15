'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setupAcademicYearAndSchedule } from '@/lib/actions/schoolActions';
import { Clock, Calendar, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const DAYS_OPTIONS = [
  { label: 'Monday', value: 'MONDAY' },
  { label: 'Tuesday', value: 'TUESDAY' },
  { label: 'Wednesday', value: 'WEDNESDAY' },
  { label: 'Thursday', value: 'THURSDAY' },
  { label: 'Friday', value: 'FRIDAY' },
  { label: 'Saturday', value: 'SATURDAY' },
];

export default function SchoolSetupPage() {
  const router = RouterHook();
  const [isPending, startTransition] = useTransition();

  const [year, setYear] = useState('2026/2027');
  const [periodDurationMinutes, setPeriodDurationMinutes] = useState(50);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ]);
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('15:30');

  const [breaks, setBreaks] = useState<{ name: string; startTime: string; endTime: string }[]>([
    { name: 'Morning Break', startTime: '09:10', endTime: '09:30' },
    { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' },
  ]);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleDayToggle(day: string) {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Must have at least 1 day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  }

  function addBreak() {
    setBreaks([...breaks, { name: 'Short Break', startTime: '10:30', endTime: '10:45' }]);
  }

  function removeBreak(index: number) {
    setBreaks(breaks.filter((_, i) => i !== index));
  }

  function handleBreakChange(index: number, field: string, value: string) {
    const updated = [...breaks];
    updated[index] = { ...updated[index], [field]: value };
    setBreaks(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    // Hardcode schoolId for Mboa College
    const schoolId = 'school_mboa_college_01';

    startTransition(async () => {
      try {
        const res = await setupAcademicYearAndSchedule(schoolId, {
          year,
          periodDurationMinutes: Number(periodDurationMinutes),
          days: selectedDays,
          startTime,
          endTime,
          breaks,
        });

        if (res.success) {
          setMessage({
            type: 'success',
            text: `Operating hours & schedule updated successfully! Generated ${res.count} period slots per day.`,
          });
          router.refresh();
        }
      } catch (err: any) {
        setMessage({
          type: 'error',
          text: err.message || 'Failed to save schedule configuration.',
        });
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">School Setup & Schedule</h1>
        <p className="text-slate-400 mt-1">
          Configure academic year operating hours, period length, working days, and recess breaks.
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
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Year & Period Duration */}
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Academic Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Academic Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026/2027"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Period Duration (Minutes)
              </label>
              <input
                type="number"
                value={periodDurationMinutes}
                onChange={(e) => setPeriodDurationMinutes(Number(e.target.value))}
                min={30}
                max={120}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Operating Days
            </label>
            <div className="flex flex-wrap gap-3">
              {DAYS_OPTIONS.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            School Hours & Breaks
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                School Opening Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                School Closing Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Interleaved Break Slots */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Break Slots (Recess & Lunch)</h3>
              <button
                type="button"
                onClick={addBreak}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md font-medium flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                Add Break
              </button>
            </div>

            {breaks.map((b, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 bg-slate-950 rounded-lg border border-slate-800"
              >
                <div className="md:col-span-5">
                  <input
                    type="text"
                    value={b.name}
                    onChange={(e) => handleBreakChange(idx, 'name', e.target.value)}
                    placeholder="Break Name (e.g. Lunch)"
                    required
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="time"
                    value={b.startTime}
                    onChange={(e) => handleBreakChange(idx, 'startTime', e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="time"
                    value={b.endTime}
                    onChange={(e) => handleBreakChange(idx, 'endTime', e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeBreak(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg shadow-emerald-950/40 disabled:opacity-50"
        >
          {isPending ? 'Saving & Generating Slots...' : 'Save & Calculate Schedule'}
        </button>
      </form>
    </div>
  );
}

// Router hook helper for App Router
function RouterHook() {
  return useRouter();
}
