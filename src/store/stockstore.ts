import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";

import type {
  FieldComparison,
  FilterConfig,
} from "@/types/stock";

enableMapSet();

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
  activeFilters: FilterConfig[];

  addFilter: (filter: FilterConfig) => void;
  removeFilter: (filterId: string) => void;
  clearAllFilters: () => void;

  activeComparisons: FieldComparison[];

  addComparison: (comparison: FieldComparison) => void;
  clearAllComparisons: () => void;

  sortConfig: SortConfig;

  setSortConfig: (config: SortConfig) => void;

  selectedSymbol: string | null;

  setSelectedSymbol: (symbol: string | null) => void;

  livePrices: Map<string, PriceData>;

  batchUpdatePrices: (
    updates: Map<string, PriceUpdate>,
  ) => void;

  watchlist: Set<string>;

  toggleWatchlist: (symbol: string) => void;
}

export const useStockStore =
  create<StockStore>()(
    immer(
      devtools(
        persist(
          (set) => ({
            activeFilters: [],

            addFilter: (filter) =>
              set((state) => {
                state.activeFilters.push(filter);
              }),

            removeFilter: (filterId) =>
              set((state) => {
                state.activeFilters =
                  state.activeFilters.filter(
                    (filter) =>
                      filter.id !== filterId,
                  );
              }),

            clearAllFilters: () =>
              set((state) => {
                state.activeFilters = [];
              }),

            activeComparisons: [],

            addComparison: (comparison) =>
              set((state) => {
                state.activeComparisons.push(
                  comparison,
                );
              }),

            clearAllComparisons: () =>
              set((state) => {
                state.activeComparisons = [];
              }),

            sortConfig: {
              column: "marketCap",
              direction: "desc",
            },

            setSortConfig: (config) =>
              set((state) => {
                state.sortConfig = config;
              }),

            selectedSymbol: null,

            setSelectedSymbol: (symbol) =>
              set((state) => {
                state.selectedSymbol = symbol;
              }),

            livePrices: new Map(),

            batchUpdatePrices: (updates) =>
              set((state) => {
                updates.forEach(
                  (update, symbol) => {
                    state.livePrices.set(
                      symbol,
                      {
                        ...update,
                        updatedAt: Date.now(),
                      },
                    );
                  },
                );
              }),

            watchlist: new Set(),

            toggleWatchlist: (symbol) =>
              set((state) => {
                if (
                  state.watchlist.has(symbol)
                ) {
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
          },
        ),
      ),
    ),
  );