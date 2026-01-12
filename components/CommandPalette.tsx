import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import { SUPPORTED_SYMBOLS } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (symbol: string, name: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = SUPPORTED_SYMBOLS.filter(s => 
    s.symbol.toLowerCase().includes(query.toLowerCase()) || 
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-terminal-card border border-terminal-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-terminal-border">
          <Search className="text-terminal-muted mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search symbol (e.g. AAPL)..."
            className="flex-1 bg-transparent border-none outline-none text-terminal-text placeholder-terminal-muted text-lg font-mono"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <div className="text-xs text-terminal-muted px-2 py-1 bg-terminal-border rounded">ESC</div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-terminal-muted">No symbols found.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.symbol}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-terminal-border/50 group transition-colors"
                onClick={() => {
                  onSelect(item.symbol, item.name);
                  onClose();
                  setQuery('');
                }}
              >
                <div className="flex items-center">
                  <span className="font-bold font-mono text-terminal-accent w-16">{item.symbol}</span>
                  <span className="text-terminal-text text-sm">{item.name}</span>
                </div>
                <Plus size={16} className="text-terminal-muted group-hover:text-terminal-up opacity-0 group-hover:opacity-100" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};