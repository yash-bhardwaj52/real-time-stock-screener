"use client";

import { useEffect, useState } from "react";
import StockScreener from "@/components/StockScreener";
import { syncStocksFromServer } from "@/lib/offlineCache";
import type { Stock } from "@/types/stock";

export default function StockScreenerLoader() {
  const [stocks, setStocks] = useState<Stock[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStocks() {
      try {
        const data = await syncStocksFromServer();

        if (!cancelled) {
          setStocks(data);
        }
      } catch (err) {
        console.error("Failed to load stocks:", err);

        if (!cancelled) {
          setError("Failed to load stock data.");
        }
      }
    }

    loadStocks();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300"
      >
        {error}
      </div>
    );
  }

  if (!stocks) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-gray-300"
      >
        Loading stock data...
      </div>
    );
  }

  return <StockScreener initialData={stocks} />;
}