'use client';

import { Lock, Unlock, School, MapPin, User, Coffee } from 'lucide-react';
import { DisplayMode } from './ViewToggle';

interface ClassTimetableGridProps {
  selectedSectionId: string;
  classSections: { id: string; name: string }[];
  onSelectSection: (id: string) => void;
  days: { day: string }[];
  periods: { id: string; periodNumber: number; startTime: string; endTime: string }[];
  breaks: { id: string; name: string; startTime: string; endTime: string }[];
  entries: any[];
  displayMode: DisplayMode;
  onToggleLock?: (entryId: string) => void;
}

// Subject badge color palette generator
const SUBJECT_COLORS = [
  'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
  'bg-amber-500/15 border-amber-500/30 text-amber-300',
  'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
  'bg-purple-500/15 border-purple-500/30 text-purple-300',
  'bg-rose-500/15 border-rose-500/30 text-rose-300',
  'bg-blue-500/15 border-blue-500/30 text-blue-300',
  'bg-teal-500/15 border-teal-500/30 text-teal-300',
];

function getSubjectColor(name: string = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[index];
}

export default function ClassTimetableGrid({
  selectedSectionId,
  classSections,
  onSelectSection,
  days,
  periods,
  breaks,
  entries,
  displayMode,
  onToggleLock,
}: ClassTimetableGridProps) {
  // Filter entries for the selected class section
  const sectionEntries = entries.filter((e) => e.classSectionId === selectedSectionId);

  // Map entries for easy lookup: (day, periodSlotId) -> entry
  const entryMap: Record<string, any> = {};
  for (const e of sectionEntries) {
    entryMap[`${e.day}_${e.periodSlotId}`] = e;
  }

  const selectedSection = classSections.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-4">
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {selectedSection?.name || 'Select Class Stream'}
            </h2>
            <p className="text-xs text-slate-400">Class Section Weekly Schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Class Stream:</label>
          <select
            value={selectedSectionId}
            onChange={(e) => onSelectSection(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
          >
            {classSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Grid Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <th className="py-3 px-4 w-32 border-r border-slate-800 text-slate-400">
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
              {periods.map((period, pIdx) => {
                // Check if a break occurs right before or after this period
                const matchingBreak = breaks.find((b) => b.startTime === period.endTime);

                return (
                  <tr key={period.id} className="hover:bg-slate-850/40 transition-colors">
                    {/* Period Slot Label */}
                    <td className="p-3 border-r border-slate-800 bg-slate-950/60 text-slate-400 font-medium align-middle">
                      <span className="block font-bold text-white text-sm">
                        Period {period.periodNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {period.startTime} – {period.endTime}
                      </span>
                    </td>

                    {/* Day Columns */}
                    {days.map((d) => {
                      const entry = entryMap[`${d.day}_${period.id}`];

                      // Check for double period merging in UNIFIED mode
                      if (displayMode === 'UNIFIED' && pIdx > 0) {
                        const prevPeriod = periods[pIdx - 1];
                        const prevEntry = entryMap[`${d.day}_${prevPeriod.id}`];
                        if (
                          entry &&
                          prevEntry &&
                          entry.teachingAssignmentId === prevEntry.teachingAssignmentId &&
                          entry.roomId === prevEntry.roomId
                        ) {
                          // Cell merged with period above
                          return null;
                        }
                      }

                      // Check how many consecutive identical periods follow (rowSpan)
                      let rowSpan = 1;
                      if (displayMode === 'UNIFIED' && entry) {
                        for (let k = pIdx + 1; k < periods.length; k++) {
                          const nextP = periods[k];
                          const nextE = entryMap[`${d.day}_${nextP.id}`];
                          if (
                            nextE &&
                            nextE.teachingAssignmentId === entry.teachingAssignmentId &&
                            nextE.roomId === entry.roomId
                          ) {
                            rowSpan++;
                          } else {
                            break;
                          }
                        }
                      }

                      const subject = entry?.teachingAssignment?.subject;
                      const teacher = entry?.teachingAssignment?.teacher;
                      const room = entry?.room;
                      const colorStyle = entry ? getSubjectColor(subject?.name) : '';

                      return (
                        <td
                          key={d.day}
                          rowSpan={rowSpan}
                          className="p-2 border-r border-slate-800 align-top h-24"
                        >
                          {entry ? (
                            <div
                              className={`h-full p-2.5 rounded-lg border flex flex-col justify-between transition-all hover:scale-[1.01] ${colorStyle}`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-sm tracking-tight line-clamp-1">
                                    {subject?.name}
                                  </span>
                                  {onToggleLock && (
                                    <button
                                      type="button"
                                      onClick={() => onToggleLock(entry.id)}
                                      title={entry.isLocked ? 'Locked (Click to unlock)' : 'Unlocked (Click to lock)'}
                                      className={`p-1 rounded hover:bg-slate-800/60 transition-colors ${
                                        entry.isLocked ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                                      }`}
                                    >
                                      {entry.isLocked ? (
                                        <Lock className="w-3.5 h-3.5" />
                                      ) : (
                                        <Unlock className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                                <span className="inline-block text-[10px] font-mono opacity-80 uppercase px-1.5 py-0.5 rounded bg-black/20">
                                  {subject?.code}
                                </span>
                              </div>

                              <div className="pt-2 space-y-1 border-t border-white/10 text-[11px] font-medium opacity-90">
                                {teacher && (
                                  <div className="flex items-center gap-1.5">
                                    <User className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{teacher.name}</span>
                                  </div>
                                )}
                                {room && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{room.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full rounded-lg border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-[11px] bg-slate-950/20">
                              Free Slot
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
