'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createSubject, deleteSubject, createRoom, deleteRoom } from '@/lib/actions/schoolActions';
import { BookOpen, DoorOpen, Plus, Trash2, CheckCircle2, AlertCircle, FlaskConical } from 'lucide-react';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  isLabRequired: boolean;
}

interface RoomItem {
  id: string;
  name: string;
  capacity: number;
  isLab: boolean;
}

export default function SubjectsRoomsClient({
  initialSubjects,
  initialRooms,
  schoolId,
}: {
  initialSubjects: SubjectItem[];
  initialRooms: RoomItem[];
  schoolId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Subject Form State
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [isLabRequired, setIsLabRequired] = useState(false);

  // Room Form State
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(50);
  const [isLab, setIsLab] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSubjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const res = await createSubject(schoolId, {
          name: subjectName,
          code: subjectCode,
          isLabRequired,
        });

        if (res.success) {
          setMessage({ type: 'success', text: `Subject "${subjectName}" added.` });
          setSubjectName('');
          setSubjectCode('');
          setIsLabRequired(false);
          router.refresh();
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to create subject.' });
      }
    });
  }

  function handleRoomSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const res = await createRoom(schoolId, {
          name: roomName,
          capacity: Number(roomCapacity),
          isLab,
        });

        if (res.success) {
          setMessage({ type: 'success', text: `Room "${roomName}" added.` });
          setRoomName('');
          setRoomCapacity(50);
          setIsLab(false);
          router.refresh();
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to create room.' });
      }
    });
  }

  function handleDeleteSubject(id: string, name: string) {
    if (!confirm(`Delete subject "${name}"?`)) return;
    startTransition(async () => {
      await deleteSubject(id);
      setMessage({ type: 'success', text: `Subject "${name}" deleted.` });
      router.refresh();
    });
  }

  function handleDeleteRoom(id: string, name: string) {
    if (!confirm(`Delete room "${name}"?`)) return;
    startTransition(async () => {
      await deleteRoom(id);
      setMessage({ type: 'success', text: `Room "${name}" deleted.` });
      router.refresh();
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Subjects & Specialized Rooms</h1>
        <p className="text-slate-400 mt-1">
          Manage subject catalog and specialized room/lab requirements.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SUBJECTS SECTION */}
        <div className="space-y-6">
          <form onSubmit={handleSubjectSubmit} className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Add Subject
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Mathematics or Physics"
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MATH"
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLabRequired}
                    onChange={(e) => setIsLabRequired(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Requires Science Lab</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              Add Subject
            </button>
          </form>

          {/* Subjects Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white text-sm flex items-center justify-between">
              <span>Subjects Registry ({initialSubjects.length})</span>
            </div>
            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
              {initialSubjects.map((s) => (
                <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-850/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{s.name}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded font-mono">
                        {s.code}
                      </span>
                      {s.isLabRequired && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] rounded border border-indigo-500/20">
                          <FlaskConical className="w-3 h-3" /> Lab Required
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(s.id, s.name)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROOMS SECTION */}
        <div className="space-y-6">
          <form onSubmit={handleRoomSubmit} className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-emerald-400" />
              Add Room / Lab
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Physics Lab 1 or Room 102"
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Capacity</label>
                <input
                  type="number"
                  value={roomCapacity}
                  onChange={(e) => setRoomCapacity(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLab}
                    onChange={(e) => setIsLab(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Is Specialized Lab</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              Add Room
            </button>
          </form>

          {/* Rooms Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white text-sm flex items-center justify-between">
              <span>Rooms & Labs Registry ({initialRooms.length})</span>
            </div>
            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
              {initialRooms.map((r) => (
                <div key={r.id} className="p-3 flex items-center justify-between hover:bg-slate-850/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{r.name}</span>
                      <span className="text-slate-400 text-xs">Cap: {r.capacity}</span>
                      {r.isLab && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-[10px] rounded border border-emerald-500/20">
                          Science Lab
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(r.id, r.name)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
