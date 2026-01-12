import React, { useMemo, useState } from 'react';
import { 
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, ReferenceLine
} from 'recharts';
import { StockDataPoint, TimezoneMode, LayoutMode } from '../types';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface StockChartProps {
  data: StockDataPoint[];
  symbol: string;
  color: string;
  timezone: TimezoneMode;
  layout: LayoutMode;
  isMaximized: boolean;
}

// Robust Pulsing Dot Component
// Explicitly typed to handle Recharts passing chaotic props
const PulsingDot = (props: any) => {
  const { cx, cy, stroke } = props;
  
  // CRITICAL: Return null if coordinates are invalid to prevent SVG errors
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;

  return (
    <g transform={`translate(${cx}, ${cy})`} style={{ pointerEvents: 'none' }}>
      <circle r="6" fill={stroke} fillOpacity="0.3">
        <animate attributeName="r" from="6" to="20" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle r="3" fill={stroke} stroke="#090B10" strokeWidth="1" />
    </g>
  );
};

const StockChart: React.FC<StockChartProps> = React.memo(({ data, symbol, color, timezone, layout, isMaximized }) => {
  const isDense = layout === LayoutMode.DENSE && !isMaximized;

  // 1. DATA SANITIZATION
  // Ensure we never pass NaN or infinite values to Recharts
  const sanitizedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter(d => 
      Number.isFinite(d.close) && 
      Number.isFinite(d.timestamp) && 
      Number.isFinite(d.open)
    );
  }, [data]);

  // 2. SMART DOMAIN CALCULATION
  // Prevents flatline crashes and provides visual breathing room
  const domain = useMemo(() => {
    if (sanitizedData.length === 0) return [0, 100]; // Fallback
    
    const prices = sanitizedData.map(d => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) {
      // Handle flatline case
      return [min * 0.99, max * 1.01];
    }

    const range = max - min;
    const padding = range * 0.15; // 15% padding
    
    // Round to nice numbers to avoid jitter
    // e.g. 104.234123 -> 104.23
    const niceMin = Math.floor((min - padding) * 100) / 100;
    const niceMax = Math.ceil((max + padding) * 100) / 100;

    return [niceMin, niceMax];
  }, [sanitizedData]);

  // 3. COLOR & GRADIENT LOGIC
  const startPrice = sanitizedData.length > 0 ? sanitizedData[0].open : 0;
  const lastPrice = sanitizedData.length > 0 ? sanitizedData[sanitizedData.length - 1].close : 0;
  const isUp = lastPrice >= startPrice;
  const chartColor = isUp ? '#3FB950' : '#F85149';
  const gradientId = `grad-${symbol.replace(/\W/g, '')}`; // Sanitize ID

  // 4. FORMATTERS
  const formatXAxis = (tickItem: number) => {
    if (isDense) return '';
    try {
      let timeZone = 'UTC';
      if (timezone === TimezoneMode.LOCAL) timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone === TimezoneMode.NYSE) timeZone = 'America/New_York';
      const date = new Date(tickItem);
      const zonedDate = toZonedTime(date, timeZone);
      return format(zonedDate, 'HH:mm');
    } catch { return ''; }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0].payload as StockDataPoint;
    
    let timeZone = 'UTC';
    if (timezone === TimezoneMode.LOCAL) timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === TimezoneMode.NYSE) timeZone = 'America/New_York';
    
    const zonedDate = toZonedTime(new Date(point.timestamp), timeZone);

    return (
      <div className="bg-terminal-card border border-terminal-border p-3 rounded-lg shadow-2xl z-50 min-w-[180px]">
        <div className="flex justify-between items-baseline border-b border-terminal-border pb-2 mb-2">
           <span className="text-terminal-muted font-mono text-xs">{format(zonedDate, 'MMM dd')}</span>
           <span className="text-white font-mono text-xs font-bold">{format(zonedDate, 'HH:mm:ss')}</span>
        </div>
        <div className="space-y-1 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-terminal-muted">Price</span>
            <span className={point.close >= point.open ? "text-terminal-up" : "text-terminal-down"}>
              {point.close.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-muted">Vol</span>
            <span className="text-terminal-text">{point.volume.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  // 5. EMPTY STATE
  if (sanitizedData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-terminal-muted text-xs font-mono animate-pulse">
        Waiting for market data...
      </div>
    );
  }

  return (
    <div className="w-full h-full select-none" style={{ minHeight: '100px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={sanitizedData}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#161b22" 
            vertical={false} 
            horizontal={!isDense}
          />
          
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis} 
            stroke="#30363D" 
            tick={{ fill: '#484f58', fontSize: 10 }}
            minTickGap={60}
            axisLine={false}
            tickLine={false}
            height={20}
            hide={isDense}
          />
          
          <YAxis 
            domain={domain} 
            orientation="right" 
            tickFormatter={(val) => val.toFixed(2)}
            stroke="#30363D"
            tick={{ fill: '#484f58', fontSize: 10, fontFamily: 'monospace' }}
            width={45}
            scale="linear"
            axisLine={false}
            tickLine={false}
            mirror={false} 
            allowDataOverflow={false} // Important for stability
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#58A6FF', strokeWidth: 1, strokeDasharray: '4 4' }} 
            isAnimationActive={false} // Performance critical
          />

          <ReferenceLine 
            y={startPrice} 
            stroke="#30363D" 
            strokeDasharray="3 3" 
            ifOverflow="extendDomain"
          />

          {/* Area Component for the gradient fill */}
          <Area
            type="monotone"
            dataKey="close"
            stroke="none"
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />

          {/* Line Component for the sharp edge */}
          <Line
            type="monotone"
            dataKey="close"
            stroke={chartColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

          {/* Live Dot - only rendered for the LAST point */}
          <Line
            dataKey="close"
            stroke="none"
            dot={(props: any) => {
                // Only render dot for the very last data point
                const { payload } = props;
                if (payload && payload.timestamp === sanitizedData[sanitizedData.length - 1].timestamp) {
                    return <PulsingDot {...props} stroke={chartColor} />;
                }
                return <></>;
            }}
            isAnimationActive={false}
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

export default StockChart;