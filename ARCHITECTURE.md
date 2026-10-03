# Architecture

## Real-Time Stock Screener

The Real-Time Stock Screener is built using Next.js, React, TypeScript,
Zustand, TanStack Table, Lightweight Charts, WebSocket, and IndexedDB.

---

## 1. High-Level Architecture

The application follows a client-side dashboard architecture with a
Next.js API layer for stock data and a WebSocket layer for real-time
price updates.

```text
                    ┌─────────────────────┐
                    │      Next.js App     │
                    │     App Router       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Stock API Route   │
                    │    /api/stocks      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Mock Stock Data  │
                    │      5,000 Stocks   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ StockScreenerLoader │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    StockScreener    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │ Filter      │  │ Stock Table │  │ Stock Chart │
       │ Panel       │  │             │  │             │
       └──────┬──────┘  └─────────────┘  └─────────────┘
              │
              ▼
       ┌─────────────┐
       │ Filter      │
       │ Engine      │
       └─────────────┘

              WebSocket
                  │
                  ▼
       ┌──────────────────┐
       │ WebSocket Server │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────┐
       │ useWebSocket     │
       │ React Hook       │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────┐
       │ Zustand Store    │
       └──────────────────┘

              Offline
                │
                ▼
       ┌──────────────────┐
       │    IndexedDB     │
       │   Offline Cache   │
       └──────────────────┘