'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addClassWithSections, deleteClass } from '@/lib/actions/schoolActions';
import { School, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  subsystem: string;
  sections: { id: string; name: string }[];
}

export default function ClassesClient({
  initialClasses,
  schoolId,
}: {
  initialClasses: ClassItem[];
  schoolId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [className, setClassName] = useState('');
  const [subsystem, setSubsystem] = useState<'ANGLOPHONE' | 'FRANCOPHONE'>('ANGLOPHONE');
  const [armsInput, setArmsInput] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const sectionNames = armsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    startTransition(async () => {
      try {
        const res = await addClassWithSections(schoolId, {
          className,
          subsystem,
          sectionNames,
        });

        if (res.success) {
          setMessage({
            type: 'success',
            text: `Class "${className}" created with ${res.newClass.sections.length} section arm(s)!`,
          });
          setClassName('');
          setArmsInput('');
          router.refresh();
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to create class.' });
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete class "${name}"?`)) return;

    startTransition(async () => {
      try {
        await deleteClass(id);
        setMessage({ type: 'success', text: `Class "${name}" deleted.` });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to delete class.' });
      }
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Classes & Section Arms</h1>
        <p className="text-slate-400 mt-1">
          Define single-arm classes or multi-stream forms (e.g., Form 1, Form 5A, Form 5B, Lower Sixth Science).
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

      {/* Creation Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          Add New Class & Streams
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Class Name</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Form 1 or Upper Sixth"
              required
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Subsystem</label>
            <select
              value={subsystem}
              onChange={(e) => setSubsystem(e.target.value as 'ANGLOPHONE' | 'FRANCOPHONE')}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="ANGLOPHONE">Anglophone (Form 1–5, L6/U6)</option>
              <option value="FRANCOPHONE">Francophone (6ème–Terminal)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Section Arms (Optional)</span>
              <span className="text-[10px] text-emerald-400 font-normal">Blank = Single Stream</span>
            </label>
            <input
              type="text"
              value={armsInput}
              onChange={(e) => setArmsInput(e.target.value)}
              placeholder="e.g. A, B, C or leave blank"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors shadow-md shadow-emerald-950/40 disabled:opacity-50"
        >
          {isPending ? 'Creating Class...' : 'Create Class'}
        </button>
      </form>

      {/* Classes Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-400" />
            Configured Classes ({initialClasses.length})
          </h3>
        </div>

        {initialClasses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No classes created yet. Use the form above to add your first class.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {initialClasses.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-850/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">{c.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {c.subsystem}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.sections.map((sec) => (
                      <span
                        key={sec.id}
                        className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-md"
                      >
                        {sec.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  disabled={isPending}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
