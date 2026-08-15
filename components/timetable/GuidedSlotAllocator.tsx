'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  X,
  School,
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Layers,
  MapPin,
  Lock,
} from 'lucide-react';
import {
  getAvailableTeachersForSlot,
  createDirectSlotAssignmentAction,
} from '@/lib/actions/timetableActions';

interface GuidedSlotAllocatorProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  classSections: { id: string; name: string }[];
  days: { day: string }[];
  periods: { id: string; periodNumber: number; startTime: string; endTime: string }[];
  subjects: { id: string; name: string; code: string; isLabRequired: boolean }[];
  rooms: { id: string; name: string; isLab: boolean }[];
  initialClassSectionId?: string;
  initialDay?: string;
  initialPeriodSlotId?: string;
}

export default function GuidedSlotAllocator({
  isOpen,
  onClose,
  schoolId,
  classSections,
  days,
  periods,
  subjects,
  rooms,
  initialClassSectionId,
  initialDay,
  initialPeriodSlotId,
}: GuidedSlotAllocatorProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<number>(1);

  // Form selections
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassSectionId || classSections[0]?.id || ''
  );
  const [selectedDay, setSelectedDay] = useState<string>(
    initialDay || days[0]?.day || 'MONDAY'
  );

  const [allocationType, setAllocationType] = useState<'SINGLE' | 'DOUBLE'>('SINGLE');
  const [selectedPeriodSlotId, setSelectedPeriodSlotId] = useState<string>(
    initialPeriodSlotId || periods[0]?.id || ''
  );

  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');

  // Calculate contiguous double period slots
  const selectedPeriod = periods.find((p) => p.id === selectedPeriodSlotId);
  const nextPeriod = periods.find(
    (p) => p.periodNumber === (selectedPeriod ? selectedPeriod.periodNumber + 1 : 0)
  );

  const activePeriodSlotIds =
    allocationType === 'DOUBLE' && nextPeriod
      ? [selectedPeriodSlotId, nextPeriod.id]
      : [selectedPeriodSlotId];

  // Sync initial values when modal opens
  useEffect(() => {
    if (initialClassSectionId) setSelectedClassId(initialClassSectionId);
    if (initialDay) setSelectedDay(initialDay);
    if (initialPeriodSlotId) setSelectedPeriodSlotId(initialPeriodSlotId);
  }, [initialClassSectionId, initialDay, initialPeriodSlotId]);

  // Query live available teachers when Day or PeriodSlotId changes
  useEffect(() => {
    if (!isOpen) return;

    startTransition(async () => {
      try {
        const freeTeachers = await getAvailableTeachersForSlot(
          schoolId,
          selectedDay,
          activePeriodSlotIds
        );
        setAvailableTeachers(freeTeachers);
        if (freeTeachers.length > 0) {
          setSelectedTeacherId(freeTeachers[0].id);
        } else {
          setSelectedTeacherId('');
        }
      } catch (err) {
        console.error('Failed to query available teachers:', err);
      }
    });
  }, [isOpen, selectedDay, selectedPeriodSlotId, allocationType]);

  if (!isOpen) return null;

  function handleSaveAssignment() {
    if (!selectedClassId || !selectedDay || activePeriodSlotIds.length === 0) {
      setErrorMsg('Please complete all schedule selections.');
      return;
    }

    if (!selectedTeacherId) {
      setErrorMsg('No available teacher selected for this slot.');
      return;
    }

    if (!selectedSubjectId) {
      setErrorMsg('Please select a subject.');
      return;
    }

    setErrorMsg('');
    startTransition(async () => {
      const res = await createDirectSlotAssignmentAction({
        schoolId,
        classSectionId: selectedClassId,
        day: selectedDay,
        periodSlotIds: activePeriodSlotIds,
        teacherId: selectedTeacherId,
        subjectId: selectedSubjectId,
        roomId: selectedRoomId || undefined,
      });

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to assign lesson slot.');
      }
    });
  }

  const selectedClassName = classSections.find((c) => c.id === selectedClassId)?.name || 'Class';
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-6 relative">
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
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              Guided Slot-by-Slot Allocator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step guided wizard with live smart teacher availability checking.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wizard Form */}
        <div className="space-y-5 text-xs">
          {/* Step 1: Select Class */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-200 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-400" />
              Step 1: Select Target Class Stream
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              {classSections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Day */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Step 2: Select Operating Day
            </label>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => {
                const isSelected = selectedDay === d.day;
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setSelectedDay(d.day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Select Period Slot & Single/Double Toggle */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Step 3: Select Period Slot & Duration
              </label>

              {/* Single / Double Toggle */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAllocationType('SINGLE')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    allocationType === 'SINGLE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Single Period
                </button>
                <button
                  type="button"
                  onClick={() => setAllocationType('DOUBLE')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    allocationType === 'DOUBLE'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Double Period ⚡
                </button>
              </div>
            </div>

            <select
              value={selectedPeriodSlotId}
              onChange={(e) => setSelectedPeriodSlotId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  Period {p.periodNumber} ({p.startTime} – {p.endTime})
                </option>
              ))}
            </select>

            {allocationType === 'DOUBLE' && (
              <p className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-lg">
                ⚡ Contiguous Double Period selected: Period {selectedPeriod?.periodNumber} & Period{' '}
                {nextPeriod ? nextPeriod.periodNumber : 'End'} ({selectedPeriod?.startTime} –{' '}
                {nextPeriod ? nextPeriod.endTime : selectedPeriod?.endTime}).
              </p>
            )}
          </div>

          {/* Step 4: Smart Live Teacher Filter */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Step 4: Select Available Teacher (Smart Live Query)
              </label>
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
            </div>

            {availableTeachers.length === 0 ? (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg">
                ⚠️ No teachers are free during this day & time slot. Try selecting a different period slot or day.
              </div>
            ) : (
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500"
              >
                {availableTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    ✅ {t.name} (Available — Max {t.maxPerDay}/day)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 5: Select Subject & Optional Room */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Step 5: Select Subject & Facility Room
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) {s.isLabRequired ? '🔬 [Lab]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Room / Facility (Optional)</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No Special Room (Default Classroom)</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      📍 {r.name} {r.isLab ? '(Science/Computer Lab)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedSubject?.isLabRequired && (
              <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                🔬 Note: Subject "{selectedSubject.name}" requires a Laboratory room.
              </p>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <Lock className="w-4 h-4" />
            <span>Saves as Locked Slot (🔒)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAssignment}
              disabled={isPending || availableTeachers.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Assign Slot (🔒)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
