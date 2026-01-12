import { StockDataPoint, StockTicker } from '../types';

const INITIAL_POINTS = 100;

export const generateInitialData = (symbol: string, startPrice: number): StockDataPoint[] => {
  const data: StockDataPoint[] = [];
  let currentPrice = startPrice;
  const now = Date.now();
  
  // Guard: Ensure startPrice is valid
  if (!Number.isFinite(startPrice) || startPrice <= 0) currentPrice = 100;

  for (let i = INITIAL_POINTS; i > 0; i--) {
    const timestamp = now - i * 60 * 1000;
    
    // Volatility between 0.5% and -0.5%
    const change = (Math.random() - 0.5) * (currentPrice * 0.005);
    const open = currentPrice;
    currentPrice = open + change;
    
    // Ensure High/Low are logically consistent
    let high = Math.max(open, currentPrice) + Math.random() * (currentPrice * 0.001);
    let low = Math.min(open, currentPrice) - Math.random() * (currentPrice * 0.001);
    
    // Sanity check
    if (low < 0) low = 0.01;
    if (currentPrice < 0) currentPrice = 0.01;

    const volume = Math.floor(Math.random() * 10000) + 1000;
    
    data.push({
      timestamp,
      price: currentPrice,
      open,
      high,
      low,
      close: currentPrice,
      volume,
      sma20: i < INITIAL_POINTS - 20 ? currentPrice : 0
    });
  }
  return data;
};

export const simulateTick = (ticker: StockTicker): StockTicker => {
  // Defensive check for empty data
  if (!ticker.data || ticker.data.length === 0) {
     return { ...ticker, data: generateInitialData(ticker.symbol, 100) };
  }

  const lastPoint = ticker.data[ticker.data.length - 1];
  const volatility = 0.002; // 0.2% max move per tick
  const change = (Math.random() - 0.5) * (lastPoint.price * volatility);
  let newPrice = lastPoint.close + change;
  if (newPrice < 0.01) newPrice = 0.01; // Prevent negative prices

  const now = Date.now();
  const timeDiff = now - lastPoint.timestamp;
  
  // Clone data for immutability
  let newData = [...ticker.data];
  
  if (timeDiff > 5000) {
    // New Candle
    const newPoint: StockDataPoint = {
      timestamp: now,
      price: newPrice,
      open: newPrice,
      high: newPrice,
      low: newPrice,
      close: newPrice,
      volume: Math.floor(Math.random() * 500),
      sma20: 0
    };
    newData.push(newPoint);
    if (newData.length > 200) newData.shift();
  } else {
    // Update existing candle
    const updatedPoint = {
      ...lastPoint,
      price: newPrice,
      close: newPrice,
      high: Math.max(lastPoint.high, newPrice),
      low: Math.min(lastPoint.low, newPrice),
      volume: lastPoint.volume + Math.floor(Math.random() * 50)
    };
    newData[newData.length - 1] = updatedPoint;
  }
  
  const startPrice = newData[0].open;
  const changePercent = ((newPrice - startPrice) / startPrice) * 100;

  return {
    ...ticker,
    data: newData,
    lastPrice: newPrice,
    changePercent
  };
};

export const createTicker = (symbol: string, name: string): StockTicker => {
  const startPrice = Math.random() * 500 + 50;
  const data = generateInitialData(symbol, startPrice);
  return {
    symbol,
    name,
    data,
    color: '#3FB950', 
    lastPrice: data[data.length - 1].close,
    changePercent: 0,
    isMarketOpen: true
  };
};