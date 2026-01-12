import React from 'react';
import { StockTicker, LayoutMode, TimezoneMode } from '../types';
import StockChart from './StockChart';
import { Maximize2, Minimize2, X } from 'lucide-react';

interface StockCardProps {
  ticker: StockTicker;
  layout: LayoutMode;
  timezone: TimezoneMode;
  isMaximized: boolean;
  onMaximize: () => void;
  onRemove: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({ 
  ticker, 
  layout, 
  timezone,
  isMaximized,
  onMaximize, 
  onRemove 
}) => {
  const isUp = ticker.changePercent >= 0;
  const isDense = layout === LayoutMode.DENSE && !isMaximized;

  return (
    <div className={`
      relative flex flex-col bg-terminal-card border border-terminal-border rounded-lg 
      ${isMaximized ? 'h-full w-full shadow-2xl' : 'h-full w-full shadow-sm hover:border-terminal-muted'}
    `}>
      {/* Header */}
      <div className={`shrink-0 flex items-center justify-between px-3 py-2 border-b border-terminal-border bg-terminal-bg/50 ${isDense ? 'py-1' : ''} rounded-t-lg`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-terminal-text tracking-wide font-mono truncate" title={ticker.symbol}>{ticker.symbol}</h3>
            {!isDense && <span className="text-xs md:text-sm text-terminal-muted truncate">{ticker.name}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-right shrink-0">
          <div className="flex flex-col items-end">
            <span className={`text-xl md:text-2xl font-mono font-bold tracking-tight ${isUp ? 'text-terminal-up' : 'text-terminal-down'}`}>
              {ticker.lastPrice.toFixed(2)}
            </span>
            {!isDense && (
              <span className={`text-xs md:text-sm font-mono font-medium ${isUp ? 'text-terminal-up' : 'text-terminal-down'}`}>
                {isUp ? '+' : ''}{ticker.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onMaximize}
              className="p-1 hover:bg-terminal-border rounded text-terminal-muted hover:text-terminal-text"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button 
              onClick={onRemove}
              className="p-1 hover:bg-red-900/30 rounded text-terminal-muted hover:text-red-400"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Area - Flex 1 to fill remaining space, min-h-0 to allow shrinking */}
      <div className="flex-1 min-h-0 w-full p-1 relative z-0">
        <StockChart 
          data={ticker.data} 
          symbol={ticker.symbol}
          color={ticker.color} 
          timezone={timezone}
          layout={layout}
          isMaximized={isMaximized}
        />
      </div>
      
      {/* Footer Info */}
      {!isDense && !isMaximized && (
        <div className="shrink-0 flex justify-between px-3 py-1 border-t border-terminal-border text-[10px] text-terminal-muted font-mono rounded-b-lg">
           <span>Vol: {(ticker.data[ticker.data.length-1].volume / 1000).toFixed(1)}k</span>
           <span>Open: {ticker.data[0]?.open.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};