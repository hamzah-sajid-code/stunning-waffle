import React from 'react';
import { LayoutMode, TimezoneMode } from '../types';
import { LayoutGrid, Grid, Square, Columns, Clock, Search } from 'lucide-react';

interface ControlBarProps {
  layout: LayoutMode;
  setLayout: (mode: LayoutMode) => void;
  timezone: TimezoneMode;
  setTimezone: (tz: TimezoneMode) => void;
  onSearchOpen: () => void;
  stockCount: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  layout, 
  setLayout, 
  timezone, 
  setTimezone,
  onSearchOpen,
  stockCount
}) => {
  return (
    <div className="h-14 border-b border-terminal-border bg-terminal-bg flex items-center justify-between px-4 md:px-6 shrink-0 overflow-x-auto overflow-y-hidden custom-scrollbar gap-4">
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="flex items-center gap-2 text-terminal-accent shrink-0">
          <div className="w-2 h-2 rounded-full bg-terminal-up animate-pulse" />
          <span className="font-bold text-base md:text-lg tracking-wider whitespace-nowrap">SAJID<span className="text-white">MATLOOB</span></span>
        </div>
        
        <div className="h-6 w-px bg-terminal-border mx-1 md:mx-2 shrink-0" />
        
        <div className="flex items-center bg-terminal-card border border-terminal-border rounded-lg p-1 shrink-0">
          <button 
            onClick={() => setLayout(LayoutMode.SINGLE)}
            className={`p-1.5 rounded ${layout === LayoutMode.SINGLE ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'}`}
            title="Single Focus"
          >
            <Square size={16} />
          </button>
          <button 
            onClick={() => setLayout(LayoutMode.TWO_COL)}
            className={`p-1.5 rounded ${layout === LayoutMode.TWO_COL ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'}`}
            title="2 Columns"
          >
            <Columns size={16} />
          </button>
          <button 
            onClick={() => setLayout(LayoutMode.THREE_COL)}
            className={`p-1.5 rounded ${layout === LayoutMode.THREE_COL ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'}`}
            title="3 Columns"
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setLayout(LayoutMode.DENSE)}
            className={`p-1.5 rounded ${layout === LayoutMode.DENSE ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'}`}
            title="Dense Grid"
          >
            <Grid size={16} />
          </button>
        </div>

        <button 
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 bg-terminal-card border border-terminal-border rounded-lg text-sm text-terminal-muted hover:text-white hover:border-terminal-muted transition-colors shrink-0"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search Symbol</span>
          <kbd className="hidden sm:inline ml-2 text-xs bg-terminal-border px-1.5 rounded text-terminal-text">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-terminal-muted bg-terminal-card px-2 py-1 rounded border border-terminal-border whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full bg-terminal-up" />
          MARKET OPEN
        </div>

        <div className="hidden md:block h-6 w-px bg-terminal-border" />

        <div className="flex items-center gap-2 shrink-0">
          <Clock size={16} className="text-terminal-muted" />
          <select 
            value={timezone}
            onChange={(e) => setTimezone(e.target.value as TimezoneMode)}
            className="bg-transparent text-sm text-terminal-text font-mono border-none outline-none cursor-pointer hover:text-white"
          >
            <option value={TimezoneMode.LOCAL}>Local</option>
            <option value={TimezoneMode.NYSE}>NYSE</option>
            <option value={TimezoneMode.UTC}>UTC</option>
          </select>
        </div>
      </div>
    </div>
  );
};