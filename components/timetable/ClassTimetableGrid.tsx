'use client';

import { useState } from 'react';
import { Lock, Unlock, School, MapPin, User, GripVertical, Plus } from 'lucide-react';
import { DisplayMode } from './ViewToggle';
import EditSlotModal from './EditSlotModal';
import { validateSlotMove } from '@/lib/timetable/conflictEngine';

interface ClassTimetableGridProps {
  selectedSectionId: string;
  classSections: { id: string; name: string }[];
  onSelectSection: (id: string) => void;
  days: { day: string }[];
  periods: { id: string; periodNumber: number; startTime: string; endTime: string }[];
  breaks: { id: string; name: string; startTime: string; endTime: string }[];
  entries: any[];
  rooms: { id: string; name: string; isLab: boolean }[];
  displayMode: DisplayMode;
  onToggleLock: (entryId: string, isLocked: boolean) => Promise<void>;
  onUpdateRoom: (entryId: string, roomId: string | null) => Promise<void>;
  onMoveOrSwapEntry: (
    sourceEntryId: string,
    targetDay: string,
    targetPeriodSlotId: string
  ) => Promise<{ success: boolean; error?: string; conflicts?: string[] }>;
  onConflictAlert?: (conflicts: string[]) => void;
  onOpenGuidedAllocator?: (classSectionId: string, day: string, periodSlotId: string) => void;
}

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

export default function ClassTimetableGrid({
  selectedSectionId,
  classSections,
  onSelectSection,
  days,
  periods,
  breaks,
  entries,
  rooms,
  displayMode,
  onToggleLock,
  onUpdateRoom,
  onMoveOrSwapEntry,
  onConflictAlert,
  onOpenGuidedAllocator,
}: ClassTimetableGridProps) {
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState<any | null>(null);
  const [draggedEntry, setDraggedEntry] = useState<any | null>(null);

  // Filter entries for the selected class section
  const sectionEntries = entries.filter((e) => e.classSectionId === selectedSectionId);

  // Map entries for easy lookup: (day, periodSlotId) -> entry
  const entryMap: Record<string, any> = {};
  for (const e of sectionEntries) {
    entryMap[`${e.day}_${e.periodSlotId}`] = e;
  }

  const selectedSection = classSections.find((s) => s.id === selectedSectionId);

  // Build Chronological Timeline (Interleaving Periods & Breaks)
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

  // Drag and Drop Handlers
  function handleDragStart(e: React.DragEvent, entry: any) {
    if (entry.isLocked) {
      e.preventDefault();
      return;
    }
    setDraggedEntry(entry);
    e.dataTransfer.setData('text/plain', entry.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function handleDrop(e: React.DragEvent, targetDay: string, targetPeriodSlotId: string) {
    e.preventDefault();
    if (!draggedEntry) return;

    if (draggedEntry.day === targetDay && draggedEntry.periodSlotId === targetPeriodSlotId) {
      setDraggedEntry(null);
      return;
    }

    const diagnostic = validateSlotMove(
      entries,
      draggedEntry,
      targetDay,
      targetPeriodSlotId,
      draggedEntry.roomId
    );

    if (!diagnostic.isValid) {
      if (onConflictAlert) {
        onConflictAlert(diagnostic.conflicts);
      }
    }

    const result = await onMoveOrSwapEntry(draggedEntry.id, targetDay, targetPeriodSlotId);
    if (!result.success && result.conflicts && onConflictAlert) {
      onConflictAlert(result.conflicts);
    }

    setDraggedEntry(null);
  }

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
            <p className="text-xs text-slate-400">
              Cameroonian Daily Schedule with Interleaved Breaks & Teacher Workloads.
            </p>
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
          <table className="w-full text-left border-collapse min-w-[750px]">
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
              {timeline.map((slot, sIdx) => {
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

                      // Merge check in UNIFIED mode
                      if (displayMode === 'UNIFIED' && sIdx > 0) {
                        const prevSlot = timeline[sIdx - 1];
                        if (prevSlot && prevSlot.type === 'PERIOD') {
                          const prevEntry = entryMap[`${d.day}_${prevSlot.id}`];
                          if (
                            entry &&
                            prevEntry &&
                            entry.teachingAssignmentId === prevEntry.teachingAssignmentId &&
                            entry.roomId === prevEntry.roomId
                          ) {
                            return null;
                          }
                        }
                      }

                      let rowSpan = 1;
                      if (displayMode === 'UNIFIED' && entry) {
                        for (let k = sIdx + 1; k < timeline.length; k++) {
                          const nextSlot = timeline[k];
                          if (nextSlot.type === 'PERIOD') {
                            const nextE = entryMap[`${d.day}_${nextSlot.id}`];
                            if (
                              nextE &&
                              nextE.teachingAssignmentId === entry.teachingAssignmentId &&
                              nextE.roomId === entry.roomId
                            ) {
                              rowSpan++;
                            } else {
                              break;
                            }
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
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, d.day, period.id)}
                          className="p-2 border-r border-slate-800 align-top h-24 transition-colors"
                        >
                          {entry ? (
                            <div
                              draggable={!entry.isLocked}
                              onDragStart={(e) => handleDragStart(e, entry)}
                              onClick={() => setSelectedEntryForEdit(entry)}
                              className={`h-full p-2.5 rounded-lg border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${colorStyle} ${
                                entry.isLocked ? 'ring-1 ring-amber-500/50' : 'hover:border-white/40'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-extrabold text-sm tracking-tight line-clamp-1 flex items-center gap-1 text-white">
                                    {!entry.isLocked && (
                                      <GripVertical className="w-3 h-3 text-slate-400 opacity-60 shrink-0 cursor-grab" />
                                    )}
                                    {subject?.name}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleLock(entry.id, !entry.isLocked);
                                    }}
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
                                </div>
                                <span className="inline-block text-[10px] font-mono opacity-80 uppercase px-1.5 py-0.5 rounded bg-black/20">
                                  {subject?.code}
                                </span>
                              </div>

                              {/* Teacher Name Rendered Below Subject Name */}
                              <div className="pt-2 space-y-1 border-t border-white/10 text-[11px] font-medium opacity-90">
                                {teacher && (
                                  <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                                    <User className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                                    <span className="truncate">👨‍🏫 {teacher.name}</span>
                                  </div>
                                )}
                                {room && (
                                  <div className="flex items-center gap-1.5 text-slate-300">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">📍 {room.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenGuidedAllocator &&
                                onOpenGuidedAllocator(selectedSectionId, d.day, period.id)
                              }
                              className="w-full h-full rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 text-[11px] bg-slate-950/20 hover:bg-emerald-950/10 transition-colors group"
                            >
                              <Plus className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                              <span>+ Assign Lesson</span>
                            </button>
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

      {/* Edit Slot Modal */}
      {selectedEntryForEdit && (
        <EditSlotModal
          isOpen={!!selectedEntryForEdit}
          onClose={() => setSelectedEntryForEdit(null)}
          entry={selectedEntryForEdit}
          rooms={rooms}
          onToggleLock={onToggleLock}
          onUpdateRoom={onUpdateRoom}
        />
      )}
    </div>
  );
}
