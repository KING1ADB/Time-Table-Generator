'use client';

import { Grid, User, LayoutGrid, Layers, Columns } from 'lucide-react';

export type ViewTab = 'CLASS' | 'TEACHER' | 'MASTER';
export type DisplayMode = 'UNIFIED' | 'SPLIT';

interface ViewToggleProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

export default function ViewToggle({
  activeTab,
  onTabChange,
  displayMode,
  onDisplayModeChange,
}: ViewToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-900 rounded-xl border border-slate-800">
      {/* View Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          type="button"
          onClick={() => onTabChange('CLASS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'CLASS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          Class View
        </button>

        <button
          type="button"
          onClick={() => onTabChange('TEACHER')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'TEACHER'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Teacher View
        </button>

        <button
          type="button"
          onClick={() => onTabChange('MASTER')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'MASTER'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Master View
        </button>
      </div>

      {/* Block Display Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Block Layout:</span>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onDisplayModeChange('UNIFIED')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              displayMode === 'UNIFIED'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Merge double periods into single continuous block"
          >
            <Layers className="w-3.5 h-3.5" />
            Unified Block
          </button>

          <button
            type="button"
            onClick={() => onDisplayModeChange('SPLIT')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              displayMode === 'SPLIT'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Display each 45/50m period cell individually"
          >
            <Columns className="w-3.5 h-3.5" />
            Split Cell
          </button>
        </div>
      </div>
    </div>
  );
}
