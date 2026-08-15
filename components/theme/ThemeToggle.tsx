'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-slate-950/80 dark:bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-emerald-500 text-white font-bold shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-emerald-500 text-white font-bold shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-emerald-500 text-white font-bold shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
        title="Sync with System Device Preference"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
