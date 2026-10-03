"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCachedStocks,
  saveStocks,
  syncStocksFromServer,
} from "@/lib/offlineCache";

import StockTable from "@/components/StockTable";
import FilterPanel from "@/components/filters/FilterPanel";
import PresetSelector from "@/components/filters/PresetSelector";
import StockChart from "@/components/charts/StockCharts";

import {
  useWebSocket,
  type PriceUpdate,
} from "@/hooks/useWebSocket";

import { filterStocks } from "@/lib/filterEngine";
import { useStockStore } from "@/store/stockstore";
import type { Stock } from "@/types/stock";

interface StockScreenerProps {
  initialData: Stock[];
}

export default function StockScreener({
  initialData,
}: StockScreenerProps) {
  const [stocks, setStocks] =
    useState<Stock[]>(initialData);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [isOffline, setIsOffline] =
    useState(false);

  const [isSyncing, setIsSyncing] =
    useState(false);

  useEffect(() => {
    if (initialData.length === 0) {
      return;
    }

    setStocks(initialData);

    saveStocks(initialData).catch((error) => {
      console.error(
        "Failed to cache stocks:",
        error,
      );
    });
  }, [initialData]);

  useEffect(() => {
    if (navigator.onLine) {
      return;
    }

    getCachedStocks()
      .then((cachedStocks) => {
        if (cachedStocks?.length) {
          setStocks(cachedStocks);
        }
      })
      .catch((error) => {
        console.error(
          "Failed to load cached stocks:",
          error,
        );
      });
  }, []);

  const syncLatestStocks = useCallback(
    async () => {
      if (!navigator.onLine) {
        return;
      }

      setIsSyncing(true);

      try {
        const freshStocks =
          await syncStocksFromServer();

        if (freshStocks.length > 0) {
          setStocks(freshStocks);
        }

        console.log(
          `Stock universe synced: ${freshStocks.length} stocks`,
        );
      } catch (error) {
        console.error(
          "Failed to sync latest stocks:",
          error,
        );
      } finally {
        setIsSyncing(false);
      }
    },
    [],
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);

      syncLatestStocks();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener(
      "online",
      handleOnline,
    );

    window.addEventListener(
      "offline",
      handleOffline,
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );
    };
  }, [syncLatestStocks]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeFilters = useStockStore(
    (state) => state.activeFilters,
  );

  const activeComparisons = useStockStore(
    (state) => state.activeComparisons,
  );

  const selectedSymbol = useStockStore(
    (state) => state.selectedSymbol,
  );

  const batchUpdatePrices = useStockStore(
    (state) => state.batchUpdatePrices,
  );

  const handleLiveUpdates = useCallback(
    (updates: PriceUpdate[]) => {
      const priceMap = new Map<
        string,
        {
          price: number;
          change: number;
          changePercent: number;
        }
      >();

      for (const update of updates) {
        priceMap.set(update.symbol, {
          price: update.price,
          change: update.changeAbsolute,
          changePercent:
            update.changePercent,
        });
      }

      batchUpdatePrices(priceMap);
    },
    [batchUpdatePrices],
  );

  const { status: websocketStatus } =
    useWebSocket({
      onUpdates: handleLiveUpdates,
      enabled: !isOffline,
    });

  const filterResult = useMemo(() => {
    return filterStocks(
      stocks,
      activeFilters,
      [],
      activeComparisons,
    );
  }, [
    stocks,
    activeFilters,
    activeComparisons,
  ]);

  const filteredStocks =
    filterResult.stocks;

  const selectedStock =
    filteredStocks.find(
      (stock) =>
        stock.symbol === selectedSymbol,
    ) ?? null;

  const sectors = useMemo(() => {
    return Array.from(
      new Set(
        stocks.map(
          (stock) => stock.sector,
        ),
      ),
    ).sort();
  }, [stocks]);

  const industries = useMemo(() => {
    return Array.from(
      new Set(
        stocks.map(
          (stock) => stock.industry,
        ),
      ),
    ).sort();
  }, [stocks]);

  const indices = useMemo(() => {
    return Array.from(
      new Set(
        stocks.flatMap(
          (stock) =>
            stock.indexMembership,
        ),
      ),
    ).sort();
  }, [stocks]);

  const statusLabel =
    websocketStatus === "connected"
      ? "Live"
      : websocketStatus ===
          "reconnecting"
        ? "Reconnecting"
        : "Offline";

  const statusClass =
    websocketStatus === "connected"
      ? "bg-green-500"
      : websocketStatus ===
          "reconnecting"
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="min-w-0 space-y-6">
      {isOffline && (
        <div className="rounded-md border border-yellow-800 bg-yellow-950/40 px-4 py-3 text-sm text-yellow-300">
          Working offline - prices may be stale
        </div>
      )}

      {isSyncing && !isOffline && (
        <div className="rounded-md border border-blue-800 bg-blue-950/40 px-4 py-3 text-sm text-blue-300">
          Syncing latest stock data...
        </div>
      )}

      <PresetSelector />

      <div
        className={`grid min-w-0 grid-cols-1 gap-6 ${
          sidebarCollapsed
            ? "lg:grid-cols-[72px_minmax(0,1fr)]"
            : "lg:grid-cols-[320px_minmax(0,1fr)]"
        }`}
      >
        <aside className="min-w-0">
          <FilterPanel
            sectors={sectors}
            industries={industries}
            indices={indices}
            matchingCount={
              filteredStocks.length
            }
            totalCount={
              stocks.length
            }
            collapsed={
              sidebarCollapsed
            }
            onToggleCollapse={() =>
              setSidebarCollapsed(
                (collapsed) =>
                  !collapsed,
              )
            }
          />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-gray-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {filteredStocks.length.toLocaleString()}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {stocks.length.toLocaleString()}
                </span>{" "}
                stocks
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-400">
                <span
                  className={`h-2 w-2 rounded-full ${statusClass}`}
                />
                <span>{statusLabel}</span>
              </div>

              {mounted && (
                <div className="shrink-0 rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-400">
                  Filter response:{" "}
                  <span className="font-semibold text-white">
                    {filterResult.executionTimeMs.toFixed(
                      2,
                    )}{" "}
                    ms
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            className="
              grid
              min-w-0
              grid-cols-1
              gap-4
              xl:grid-cols-[minmax(0,3fr)_minmax(400px,2fr)]
              xl:items-start
            "
          >
            <section className="min-w-0">
              <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">
                  Stock Screener
                </h2>

                <span className="text-xs text-gray-500">
                  Click a stock to open its chart
                </span>
              </div>

              <div className="min-w-0 overflow-hidden rounded-lg">
                <StockTable
                  data={filteredStocks}
                />
              </div>
            </section>

            <section className="min-w-0 xl:sticky xl:top-4">
              {selectedStock ? (
                <div className="min-w-0">
                  <StockChart
                    stock={selectedStock}
                  />
                </div>
              ) : (
                <div
                  className="
                    flex
                    min-h-[400px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    border-gray-700
                    bg-gray-950
                    px-6
                    text-center
                  "
                >
                  <div>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gray-800 bg-gray-900">
                      <span className="text-xl text-gray-500">
                        ↗
                      </span>
                    </div>

                    <p className="text-base font-medium text-gray-300">
                      Select a stock
                    </p>

                    <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500">
                      Click any row in the stock
                      table to open its interactive
                      chart.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}