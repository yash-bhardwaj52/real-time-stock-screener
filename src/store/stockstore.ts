import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";

import type { FilterConfig } from "@/types/stock";

interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  updatedAt: number;
}

interface PriceUpdate {
  price: number;
  change: number;
  changePercent: number;
}

interface StockStore {
  // Filter state
  activeFilters: FilterConfig[];
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (filterId: string) => void;
  clearAllFilters: () => void;

  // Sort state
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;

  // Selection state
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;

  // Real-time prices
  livePrices: Map<string, PriceData>;
  batchUpdatePrices: (updates: Map<string, PriceUpdate>) => void;

  // Watchlist
  watchlist: Set<string>;
  toggleWatchlist: (symbol: string) => void;
}

export const useStockStore = create<StockStore>()(
  immer(
    devtools(
      persist(
        (set) => ({
          // Filters
          activeFilters: [],

          addFilter: (filter) =>
            set((state) => {
              state.activeFilters.push(filter);
            }),

          removeFilter: (filterId) =>
            set((state) => {
              state.activeFilters = state.activeFilters.filter(
                (filter) => filter.id !== filterId
              );
            }),

          clearAllFilters: () =>
            set((state) => {
              state.activeFilters = [];
            }),

          // Sorting
          sortConfig: {
            column: "marketCap",
            direction: "desc",
          },

          setSortConfig: (config) =>
            set((state) => {
              state.sortConfig = config;
            }),

          // Selection
          selectedSymbol: null,

          setSelectedSymbol: (symbol) =>
            set((state) => {
              state.selectedSymbol = symbol;
            }),

          // Live prices
          livePrices: new Map(),
batchUpdatePrices: (updates) =>
  set((state) => {
    updates.forEach((update, symbol) => {
      state.livePrices.set(symbol, {
        ...update,
        updatedAt: Date.now(),
      });
    });
  }),
          // Watchlist
          watchlist: new Set(),

          toggleWatchlist: (symbol) =>
            set((state) => {
              if (state.watchlist.has(symbol)) {
                state.watchlist.delete(symbol);
              } else {
                state.watchlist.add(symbol);
              }
            }),
        }),
        {
          name: "stock-store",
          partialize: (state) => ({
            watchlist: state.watchlist,
          }),
        }
      )
    )
  )
);