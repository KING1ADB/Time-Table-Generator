'use client';

import { useState, useTransition } from 'react';
import { X, Lock, Unlock, MapPin, User, BookOpen, School, Clock, CheckCircle2 } from 'lucide-react';

interface EditSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  rooms: { id: string; name: string; isLab: boolean }[];
  onToggleLock: (entryId: string, isLocked: boolean) => Promise<void>;
  onUpdateRoom: (entryId: string, roomId: string | null) => Promise<void>;
}

export default function EditSlotModal({
  isOpen,
  onClose,
  entry,
  rooms,
  onToggleLock,
  onUpdateRoom,
}: EditSlotModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(entry?.roomId || '');

  if (!isOpen || !entry) return null;

  const subject = entry.teachingAssignment?.subject;
  const teacher = entry.teachingAssignment?.teacher;
  const classSection = entry.classSection;
  const period = entry.periodSlot;

  function handleLockToggle() {
    startTransition(async () => {
      await onToggleLock(entry.id, !entry.isLocked);
    });
  }

  function handleRoomChange(newRoomId: string) {
    const roomIdToSave = newRoomId === '' ? null : newRoomId;
    setSelectedRoomId(newRoomId);
    startTransition(async () => {
      await onUpdateRoom(entry.id, roomIdToSave);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {subject?.name} ({subject?.code})
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <School className="w-3.5 h-3.5 text-emerald-400" />
              <span>{classSection?.name}</span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase">{entry.day}</span> Period {period?.periodNumber} ({period?.startTime}–{period?.endTime})
            </p>
          </div>
        </div>

        {/* Slot Details */}
        <div className="space-y-4 text-xs">
          {/* Teacher Info */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <User className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-white font-semibold text-sm block">{teacher?.name}</span>
                <span className="text-slate-500">Instructor</span>
              </div>
            </div>
            {subject?.isLabRequired && (
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold rounded">
                Lab Required
              </span>
            )}
          </div>

          {/* Room Reassignment Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Assigned Room / Facility
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => handleRoomChange(e.target.value)}
              disabled={isPending}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500 font-medium disabled:opacity-50"
            >
              <option value="">No Room Assigned (General Classroom)</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.isLab ? '(Science Lab)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Granular Lock Toggle */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  {entry.isLocked ? (
                    <Lock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-slate-400" />
                  )}
                  Slot Lock Preservation (🔒)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Locked slots stay 100% frozen during auto-regeneration.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLockToggle}
                disabled={isPending}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                  entry.isLocked
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {entry.isLocked ? '🔒 Locked' : '🔓 Unlock'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
