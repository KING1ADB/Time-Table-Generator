'use client';

import { User, School, MapPin, CheckCircle2, Clock } from 'lucide-react';

interface TeacherTimetableGridProps {
  selectedTeacherId: string;
  teachers: { id: string; name: string; maxPerDay: number }[];
  onSelectTeacher: (id: string) => void;
  days: { day: string }[];
  periods: { id: string; periodNumber: number; startTime: string; endTime: string }[];
  breaks?: { id: string; name: string; startTime: string; endTime: string }[];
  entries: any[];
}

interface TimelineSlot {
  type: 'PERIOD' | 'BREAK';
  id: string;
  name: string;
  periodNumber?: number;
  startTime: string;
  endTime: string;
  periodObj?: any;
  breakObj?: any;
}

export default function TeacherTimetableGrid({
  selectedTeacherId,
  teachers,
  onSelectTeacher,
  days,
  periods,
  breaks = [],
  entries,
}: TeacherTimetableGridProps) {
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Filter entries for the selected teacher
  const teacherEntries = entries.filter(
    (e) => e.teachingAssignment?.teacherId === selectedTeacherId
  );

  // Map entries for easy lookup: (day, periodSlotId) -> entry
  const entryMap: Record<string, any> = {};
  for (const e of teacherEntries) {
    entryMap[`${e.day}_${e.periodSlotId}`] = e;
  }

  // Workload metrics
  const totalAssignedPeriods = teacherEntries.length;

  // Build Chronological Timeline
  const timeline: TimelineSlot[] = [];
  periods.forEach((p) => {
    timeline.push({
      type: 'PERIOD',
      id: p.id,
      name: `P${p.periodNumber}`,
      periodNumber: p.periodNumber,
      startTime: p.startTime,
      endTime: p.endTime,
      periodObj: p,
    });
  });

  breaks.forEach((b) => {
    timeline.push({
      type: 'BREAK',
      id: b.id || `break_${b.name}`,
      name: b.name,
      startTime: b.startTime,
      endTime: b.endTime,
      breakObj: b,
    });
  });

  timeline.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-4">
      {/* Header Selector & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {selectedTeacher?.name || 'Select Teacher'}
            </h2>
            <p className="text-xs text-slate-400">Teacher Weekly Workload Schedule</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold text-white">{totalAssignedPeriods}</span>
              <span className="text-slate-400">periods/wk</span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Max {selectedTeacher?.maxPerDay || 6}/day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Select Teacher:</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => onSelectTeacher(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <th className="py-3 px-4 w-36 border-r border-slate-800 text-slate-400">
                  Time / Slot
                </th>
                {days.map((d) => (
                  <th key={d.day} className="py-3 px-4 text-center border-r border-slate-800 uppercase tracking-wider">
                    {d.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {timeline.map((slot) => {
                if (slot.type === 'BREAK') {
                  return (
                    <tr key={slot.id} className="bg-amber-950/20 border-y border-amber-500/20">
                      <td className="p-3 bg-amber-950/40 text-amber-300 font-bold text-xs border-r border-amber-500/20 align-middle">
                        <span className="block text-amber-200 font-extrabold">☕ {slot.name}</span>
                        <span className="text-[10px] text-amber-400/80">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </td>
                      <td
                        colSpan={days.length}
                        className="p-3 text-center bg-amber-500/10 text-amber-300 font-bold text-xs tracking-wider"
                      >
                        ☕ RECESS / BREAK INTERVAL ({slot.startTime} – {slot.endTime}) — NO LESSONS
                      </td>
                    </tr>
                  );
                }

                const period = slot.periodObj;

                return (
                  <tr key={slot.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="p-3 border-r border-slate-800 bg-slate-950/60 text-slate-400 font-medium align-middle">
                      <span className="block font-bold text-white text-sm">
                        Period {period.periodNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {period.startTime} – {period.endTime}
                      </span>
                    </td>

                    {days.map((d) => {
                      const entry = entryMap[`${d.day}_${period.id}`];
                      const classSection = entry?.classSection;
                      const subject = entry?.teachingAssignment?.subject;
                      const teacher = entry?.teachingAssignment?.teacher;
                      const room = entry?.room;

                      return (
                        <td key={d.day} className="p-2 border-r border-slate-800 align-top h-24">
                          {entry ? (
                            <div className="h-full p-2.5 rounded-lg border bg-indigo-500/15 border-indigo-500/30 text-indigo-200 flex flex-col justify-between">
                              <div className="space-y-1">
                                <span className="font-extrabold text-sm text-white tracking-tight line-clamp-1 block">
                                  {subject?.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                                  <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="font-semibold">{classSection?.name}</span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-white/10 space-y-0.5 text-[11px]">
                                {teacher && (
                                  <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                                    <User className="w-3 h-3 shrink-0 text-blue-400" />
                                    <span className="truncate">👨‍🏫 {teacher.name}</span>
                                  </div>
                                )}
                                {room && (
                                  <div className="flex items-center gap-1.5 text-slate-300">
                                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                    <span className="truncate">📍 {room.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full rounded-lg border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-[11px] bg-slate-950/20">
                              Free Period
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
