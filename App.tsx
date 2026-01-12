import React, { useState, useEffect, useCallback } from 'react';
import { LayoutMode, TimezoneMode, StockTicker } from './types';
import { createTicker, simulateTick } from './services/marketDataService';
import { StockCard } from './components/StockCard';
import { ControlBar } from './components/ControlBar';
import { CommandPalette } from './components/CommandPalette';

const INITIAL_SYMBOLS = [
  { s: 'AAPL', n: 'Apple Inc.' },
  { s: 'NVDA', n: 'NVIDIA Corp.' },
  { s: 'TSLA', n: 'Tesla Inc.' },
  { s: 'MSFT', n: 'Microsoft Corp.' }
];

const App: React.FC = () => {
  const [tickers, setTickers] = useState<StockTicker[]>([]);
  const [layout, setLayout] = useState<LayoutMode>(LayoutMode.TWO_COL);
  const [timezone, setTimezone] = useState<TimezoneMode>(TimezoneMode.LOCAL);
  const [maximizedSymbol, setMaximizedSymbol] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Initialize Data
  useEffect(() => {
    const initialTickers = INITIAL_SYMBOLS.map(sym => createTicker(sym.s, sym.n));
    setTickers(initialTickers);
  }, []);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prev => prev.map(ticker => simulateTick(ticker)));
    }, 1000); // 1 tick per second for simulation

    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        if (maximizedSymbol) setMaximizedSymbol(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, maximizedSymbol]);

  const handleAddSymbol = (symbol: string, name: string) => {
    if (tickers.find(t => t.symbol === symbol)) return;
    const newTicker = createTicker(symbol, name);
    setTickers(prev => [...prev, newTicker]);
  };

  const handleRemoveSymbol = (symbol: string) => {
    setTickers(prev => prev.filter(t => t.symbol !== symbol));
    if (maximizedSymbol === symbol) setMaximizedSymbol(null);
  };

  const getGridClass = () => {
    if (maximizedSymbol) return 'grid-cols-1';
    switch (layout) {
      case LayoutMode.SINGLE: return 'grid-cols-1';
      case LayoutMode.TWO_COL: return 'grid-cols-1 md:grid-cols-2';
      // On mobile, 1 col is better than squished 3
      case LayoutMode.THREE_COL: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      // Dense: 1 col on XS, 2 on SM, 3 on MD, 4 on LG
      case LayoutMode.DENSE: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const getGapClass = () => {
    if (layout === LayoutMode.DENSE && !maximizedSymbol) return 'gap-3 md:gap-2';
    return 'gap-4 md:gap-6';
  };

  return (
    <div className="flex flex-col h-screen bg-terminal-bg text-terminal-text overflow-hidden font-sans">
      <ControlBar 
        layout={layout} 
        setLayout={setLayout}
        timezone={timezone} 
        setTimezone={setTimezone}
        onSearchOpen={() => setIsSearchOpen(true)}
        stockCount={tickers.length}
      />

      <main className="flex-1 overflow-y-auto p-3 md:p-6 custom-scrollbar relative">
        <div className={`grid ${getGridClass()} ${getGapClass()} auto-rows-[340px] md:auto-rows-[400px] transition-all duration-300 pb-10`}>
          {tickers.map(ticker => {
            const isMaximized = maximizedSymbol === ticker.symbol;
            
            // If maximized, hide others logic handled by rendering conditionally or CSS
            // CSS approach: fixed positioning for maximized
            if (maximizedSymbol && !isMaximized) return null;

            return (
              <div 
                key={ticker.symbol} 
                className={`${isMaximized ? 'fixed inset-0 z-40 bg-terminal-bg p-3 md:p-6' : 'h-full w-full'}`}
              >
                <StockCard 
                  ticker={ticker} 
                  layout={layout} 
                  timezone={timezone}
                  isMaximized={isMaximized}
                  onMaximize={() => setMaximizedSymbol(isMaximized ? null : ticker.symbol)}
                  onRemove={() => handleRemoveSymbol(ticker.symbol)}
                />
              </div>
            );
          })}
          
          {/* Empty State placeholder if no stocks */}
          {tickers.length === 0 && (
            <div className="col-span-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-terminal-border rounded-xl text-terminal-muted m-4">
              <p className="mb-4 text-lg">No stocks tracked</p>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="px-4 py-2 bg-terminal-accent text-white rounded hover:bg-terminal-highlight"
              >
                Add Symbol (⌘K)
              </button>
            </div>
          )}
        </div>
      </main>

      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelect={handleAddSymbol} 
      />
    </div>
  );
};

export default App;