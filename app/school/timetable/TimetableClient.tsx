'use client';

import { useState, useTransition } from 'react';
import { generateTimetableAction, toggleEntryLockAction } from '@/lib/actions/timetableActions';
import ViewToggle, { ViewTab, DisplayMode } from '@/components/timetable/ViewToggle';
import ClassTimetableGrid from '@/components/timetable/ClassTimetableGrid';
import TeacherTimetableGrid from '@/components/timetable/TeacherTimetableGrid';
import MasterTimetableGrid from '@/components/timetable/MasterTimetableGrid';
import { Zap, CheckCircle2, AlertTriangle, RefreshCw, Calendar, Lock } from 'lucide-react';

interface TimetableClientProps {
  schoolId: string;
  initialData: any;
}

export default function TimetableClient({ schoolId, initialData }: TimetableClientProps) {
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<ViewTab>('CLASS');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('UNIFIED');

  const classSections = initialData.classSections || [];
  const teachers = initialData.teachers || [];
  const days = initialData.academicYear?.days || [];
  const periods = initialData.academicYear?.periods || [];
  const breaks = initialData.academicYear?.breaks || [];
  const entries = initialData.timetable?.entries || [];

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    classSections[0]?.id || ''
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers[0]?.id || ''
  );

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    executionTimeMs?: number;
    entriesCount?: number;
    diagnostics?: string[];
  } | null>(null);

  function handleGenerate() {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await generateTimetableAction(schoolId);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Timetable generated successfully!',
          executionTimeMs: res.executionTimeMs,
          entriesCount: res.entriesCount,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to generate timetable.',
          diagnostics: res.diagnostics,
        });
      }
    });
  }

  function handleToggleLock(entryId: string) {
    startTransition(async () => {
      await toggleEntryLockAction(entryId);
    });
  }

  const lockedCount = entries.filter((e: any) => e.isLocked).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Toolbar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Timetable Management Hub</h1>
            {statusMessage?.executionTimeMs !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5" />
                Generated in {statusMessage.executionTimeMs}ms
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Automated CP-SAT constraint satisfaction schedule solver & interactive timetable grid viewer
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lockedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Lock className="w-4 h-4" />
              <span>{lockedCount} Locked Slot(s)</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Solving Constraints...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                ⚡ Run Auto-Generator
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/50 border-red-500/30 text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-semibold text-white">{statusMessage.text}</p>
            {statusMessage.entriesCount !== undefined && (
              <p className="text-xs text-emerald-300">
                Assigned {statusMessage.entriesCount} total periods across operating schedule.
              </p>
            )}
            {statusMessage.diagnostics && statusMessage.diagnostics.length > 0 && (
              <div className="pt-1 space-y-1 text-xs text-red-300">
                {statusMessage.diagnostics.map((diag, i) => (
                  <p key={i}>• {diag}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Toggle Bar */}
      <ViewToggle
        activeTab={activeTab}
        onTabChange={setActiveTab}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
      />

      {/* Grid Content Views */}
      {entries.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-800 space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-white">No Timetable Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Click the <strong className="text-emerald-400">⚡ Run Auto-Generator</strong> button above to invoke the Python CP-SAT solver and generate your schedule.
            </p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'CLASS' && (
            <ClassTimetableGrid
              selectedSectionId={selectedSectionId}
              classSections={classSections}
              onSelectSection={setSelectedSectionId}
              days={days}
              periods={periods}
              breaks={breaks}
              entries={entries}
              displayMode={displayMode}
              onToggleLock={handleToggleLock}
            />
          )}

          {activeTab === 'TEACHER' && (
            <TeacherTimetableGrid
              selectedTeacherId={selectedTeacherId}
              teachers={teachers}
              onSelectTeacher={setSelectedTeacherId}
              days={days}
              periods={periods}
              entries={entries}
            />
          )}

          {activeTab === 'MASTER' && (
            <MasterTimetableGrid
              classSections={classSections}
              days={days}
              periods={periods}
              entries={entries}
            />
          )}
        </>
      )}
    </div>
  );
}
