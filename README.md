# Real-Time Stock Screener

A high-performance real-time stock screening dashboard built with Next.js,
React, TypeScript, Zustand, TanStack Table, Lightweight Charts, WebSocket,
and IndexedDB.

The application is designed to handle a 5,000-stock universe with advanced
filtering, virtualized rendering, technical analysis, real-time price updates,
watchlists, presets, and offline support.

---

## Features

### Stock Screener

- 5,000+ mock stocks
- Virtualized stock table
- Sorting
- Stock search
- Live stock count
- Responsive dashboard layout
- Watchlist support

### Advanced Filtering

The filter engine supports:

- Equal
- Not equal
- Greater than
- Greater than or equal
- Less than
- Less than or equal
- Between
- In
- Not in
- Contains
- Starts with

The application also supports:

- Multiple simultaneous filters
- AND/OR filter groups
- Field-to-field comparisons
- Filter selectivity ordering
- Active filter count
- Clear All
- Removable filter chips

### Filter Categories

Filters are organized into:

- Fundamentals
- Market Data
- Classification
- Technical
- Custom

### Preset Screeners

Four predefined screeners are available:

#### Value Stocks

- P/E < 15
- ROE > 15%
- Debt/Equity < 0.5
- Dividend Yield > 2%

#### Growth Momentum

- Revenue Growth > 20%
- Profit Growth > 20%
- RSI between 40 and 70
- Price above SMA50

#### Large Cap Quality

- Market Cap > 20,000 Cr
- ROCE > 15%
- Promoter Holding > 50%

#### Technical Breakout

- Price above SMA200
- RSI between 50 and 70
- Volume > 2x average
- Bollinger position within bands

---

## Technical Analysis

The stock chart supports:

- Candlestick charts
- OHLCV data
- Crosshair interaction
- Responsive resizing
- Timeframe switching
- Zoom and pan

Technical indicators include:

- SMA20
- SMA50
- SMA200
- EMA12
- EMA26
- Bollinger Bands
- RSI14
- Volume Profile

---

## Real-Time Updates

The application includes a WebSocket-based real-time price simulation.

The system supports:

- WebSocket connection management
- Real-time price updates
- Batch update processing
- requestAnimationFrame-based update scheduling
- Cell-level price updates
- Reconnection handling
- Exponential backoff
- Connection status indication

Reconnection delays use:

```text
1 second
2 seconds
4 seconds
8 seconds
16 seconds