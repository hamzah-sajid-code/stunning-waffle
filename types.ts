export enum LayoutMode {
  SINGLE = 'SINGLE',
  TWO_COL = 'TWO_COL',
  THREE_COL = 'THREE_COL',
  DENSE = 'DENSE'
}

export enum TimezoneMode {
  LOCAL = 'Local',
  NYSE = 'NYSE',
  UTC = 'UTC'
}

export interface StockDataPoint {
  timestamp: number;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
}

export interface StockTicker {
  symbol: string;
  name: string;
  data: StockDataPoint[];
  color: string;
  lastPrice: number;
  changePercent: number;
  isMarketOpen: boolean;
}

export interface ChartConfig {
  showVolume: boolean;
  showSMA: boolean;
  layout: LayoutMode;
  timezone: TimezoneMode;
}

export const SUPPORTED_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'AMD', name: 'Adv. Micro Devices' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'INTC', name: 'Intel Corp.' },
  { symbol: 'IBM', name: 'IBM Corp.' },
  { symbol: 'ORCL', name: 'Oracle Corp.' },
];
