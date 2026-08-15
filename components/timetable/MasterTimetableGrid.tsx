'use client';

import { useState } from 'react';
import { LayoutGrid, MapPin, User } from 'lucide-react';

interface MasterTimetableGridProps {
  classSections: { id: string; name: string }[];
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

export default function MasterTimetableGrid({
  classSections,
  days,
  periods,
  breaks = [],
  entries,
}: MasterTimetableGridProps) {
  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.day || 'MONDAY');

  // Map entries for easy lookup: (classSectionId, day, periodSlotId) -> entry
  const entryMap: Record<string, any> = {};
  for (const e of entries) {
    entryMap[`${e.classSectionId}_${e.day}_${e.periodSlotId}`] = e;
  }

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
      {/* Header & Day Filter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Institutional Master Timetable</h2>
            <p className="text-xs text-slate-400">
              Complete cross-sectional schedule matrix across all classes and streams
            </p>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {days.map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => setSelectedDay(d.day)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-all ${
                selectedDay === d.day
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {d.day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Master Grid Matrix Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Viewing Day: <strong className="text-emerald-400 uppercase">{selectedDay}</strong></span>
          <span>{classSections.length} Class Sections</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <th className="py-3 px-4 w-40 border-r border-slate-800 text-slate-400">
                  Class Stream
                </th>
                {timeline.map((slot) => (
                  <th
                    key={slot.id}
                    className={`py-3 px-3 text-center border-r border-slate-800 ${
                      slot.type === 'BREAK' ? 'bg-amber-950/40 text-amber-300' : ''
                    }`}
                  >
                    <span className="block font-bold text-white">
                      {slot.type === 'BREAK' ? `☕ ${slot.name}` : `P${slot.periodNumber}`}
                    </span>
                    <span className="text-[10px] text-slate-400">{slot.startTime}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {classSections.map((sec) => (
                <tr key={sec.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 border-r border-slate-800 bg-slate-950/60 font-bold text-white text-sm align-middle">
                    {sec.name}
                  </td>

                  {timeline.map((slot) => {
                    if (slot.type === 'BREAK') {
                      return (
                        <td
                          key={slot.id}
                          className="p-2 border-r border-slate-800 bg-amber-500/10 text-amber-300 text-center font-bold text-[10px] align-middle"
                        >
                          ☕ BREAK
                        </td>
                      );
                    }

                    const period = slot.periodObj;
                    const entry = entryMap[`${sec.id}_${selectedDay}_${period.id}`];
                    const subject = entry?.teachingAssignment?.subject;
                    const teacher = entry?.teachingAssignment?.teacher;
                    const room = entry?.room;

                    return (
                      <td key={slot.id} className="p-2 border-r border-slate-800 align-top h-20 w-32">
                        {entry ? (
                          <div className="h-full p-2 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-200 flex flex-col justify-between">
                            <div>
                              <span className="font-extrabold text-xs text-white block truncate">
                                {subject?.name}
                              </span>
                              <span className="text-[10px] text-blue-300 font-bold flex items-center gap-1 mt-0.5 truncate">
                                <User className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                                👨‍🏫 {teacher?.name}
                              </span>
                            </div>

                            {room && (
                              <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                📍 {room.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-full rounded border border-dashed border-slate-800/60 bg-slate-950/20" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
