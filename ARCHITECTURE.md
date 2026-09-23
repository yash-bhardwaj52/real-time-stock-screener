# Real-Time Stock Screener — Architecture

## 1. Project Overview

The Real-Time Stock Screener is a high-performance web application
for displaying and analyzing large amounts of stock market data.

The application is built using:

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Table
- TanStack Virtual
- Lightweight Charts

The application is designed to handle thousands of stock records
while keeping the user interface responsive.

---

## 2. Application Architecture

The application follows a component-based architecture.

Main flow:

User
  ↓
Next.js App
  ↓
React Components
  ↓
Zustand Store
  ↓
Stock Data
  ↓
Table / Charts / Filters

---

## 3. Folder Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   └── StockTable.tsx
│
├── hooks/
│
├── lib/
│   └── mockDataGenerator.ts
│
├── store/
│   └── stockstore.ts
│
├── types/
│   └── stock.ts
│
└── tests/