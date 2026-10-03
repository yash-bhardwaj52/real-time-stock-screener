import { describe, expect, it } from "vitest";

import {
  createFilterPredicate,
  filterStocks,
} from "@/lib/filterEngine";

import { generateMockStocks } from "@/lib/mockDataGenerator";

import type {
  FilterConfig,
  FilterOperator,
  FilterValue,
  Stock,
} from "@/types/stock";

function createFilter(
  id: string,
  field: keyof Stock,
  operator: FilterOperator,
  value: FilterValue,
): FilterConfig {
  return {
    id,
    field,
    operator,
    value,
    enabled: true,
  };
}

function createTestStock(
  overrides: Partial<Stock> = {},
): Stock {
  return {
    symbol: "TEST",
    companyName: "Test Company",
    sector: "IT",
    industry: "Software",
    marketCapCategory: "Large Cap",
    indexMembership: ["NIFTY 50"],

    lastPrice: 1000,
    previousClose: 990,
    dayOpen: 995,
    dayHigh: 1020,
    dayLow: 980,
    changePercent: 1.01,
    changeAbsolute: 10,
    volume: 100000,
    avgVolume20D: 80000,
    week52High: 1200,
    week52Low: 700,

    marketCap: 25000,
    pe: 20,
    pb: 4,
    dividendYield: 2.5,
    eps: 50,
    roe: 18,
    roce: 20,
    debtToEquity: 0.5,
    currentRatio: 2,
    promoterHolding: 55,
    revenueGrowthYoY: 25,
    profitGrowthYoY: 30,

    rsi14: 60,
    sma50: 950,
    sma200: 850,
    beta: 1.1,
    atr: 25,
    macdSignal: "Bullish",
    bollingerPosition: "Within",
    volumeVsAvg: "2x",

    ...overrides,
  };
}

describe("Filter Engine", () => {
  describe("Basic operators", () => {
    it("should support eq", () => {
      const stock = createTestStock({
        sector: "Banking",
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "sector",
          "eq",
          "Banking",
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should support neq", () => {
      const stock = createTestStock({
        sector: "IT",
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "sector",
          "neq",
          "Banking",
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should support gt", () => {
      const stock = createTestStock({
        roe: 20,
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "roe",
          "gt",
          15,
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should support gte", () => {
      const stock = createTestStock({
        roe: 15,
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "roe",
          "gte",
          15,
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should support lt", () => {
      const stock = createTestStock({
        pe: 10,
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "pe",
          "lt",
          15,
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should support lte", () => {
      const stock = createTestStock({
        pe: 15,
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "pe",
          "lte",
          15,
        ),
      );

      expect(predicate(stock)).toBe(true);
    });
  });

  describe("Range and list operators", () => {
    it("should support between", () => {
      const stock = createTestStock({
        pe: 20,
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "pe",
          "between",
          [15, 25],
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should include both between boundaries", () => {
      const stock = createTestStock({
        pe: 15,
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "pe",
          "between",
          [15, 25],
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should support in", () => {
      const stock = createTestStock({
        sector: "IT",
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "sector",
          "in",
          ["IT", "Banking"],
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should support notIn", () => {
      const stock = createTestStock({
        sector: "IT",
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "sector",
          "notIn",
          ["Banking", "Pharma"],
        ),
      );

      expect(predicate(stock)).toBe(true);
    });
  });

  describe("String operators", () => {
    it("should support contains", () => {
      const stock = createTestStock({
        companyName:
          "Indian Software Technologies",
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "companyName",
          "contains",
          "software",
        ),
      );

      expect(predicate(stock)).toBe(true);
    });

    it("should support startsWith", () => {
      const stock = createTestStock({
        symbol: "INFY",
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "symbol",
          "startsWith",
          "inf",
        ),
      );

      expect(predicate(stock)).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle null values", () => {
      const stock = createTestStock({
        pe: null,
      });

      const predicate = createFilterPredicate(
        createFilter(
          "1",
          "pe",
          "eq",
          20,
        ),
      );

      expect(predicate(stock)).toBe(false);
    });

    it("should return original stocks when there are no filters", () => {
      const stocks = [
        createTestStock(),
        createTestStock({
          symbol: "TEST2",
        }),
      ];

      const result = filterStocks(
        stocks,
        [],
      );

      expect(result.stocks).toHaveLength(2);
      expect(result.stocks).toEqual(stocks);
    });
  });

  describe("Combinatorial filters", () => {
    it("should apply multiple filters using AND logic", () => {
      const stocks = [
        createTestStock({
          symbol: "GOOD",
          pe: 12,
          roe: 20,
          debtToEquity: 0.4,
        }),
        createTestStock({
          symbol: "BAD_PE",
          pe: 25,
          roe: 20,
          debtToEquity: 0.4,
        }),
        createTestStock({
          symbol: "BAD_ROE",
          pe: 12,
          roe: 10,
          debtToEquity: 0.4,
        }),
        createTestStock({
          symbol: "BAD_DE",
          pe: 12,
          roe: 20,
          debtToEquity: 2,
        }),
      ];

      const filters = [
        createFilter(
          "1",
          "pe",
          "lt",
          15,
        ),
        createFilter(
          "2",
          "roe",
          "gt",
          15,
        ),
        createFilter(
          "3",
          "debtToEquity",
          "lt",
          1,
        ),
      ];

      const result = filterStocks(
        stocks,
        filters,
      );

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].symbol).toBe(
        "GOOD",
      );
    });

    it("should support OR groups", () => {
      const stocks = [
        createTestStock({
          symbol: "IT_STOCK",
          sector: "IT",
        }),
        createTestStock({
          symbol: "BANK_STOCK",
          sector: "Banking",
        }),
        createTestStock({
          symbol: "AUTO_STOCK",
          sector: "Auto",
        }),
      ];

      const result = filterStocks(
        stocks,
        [],
        [
          {
            logic: "OR",
            filters: [
              createFilter(
                "1",
                "sector",
                "eq",
                "IT",
              ),
              createFilter(
                "2",
                "sector",
                "eq",
                "Banking",
              ),
            ],
          },
        ],
      );

      expect(result.stocks).toHaveLength(2);

      expect(
        result.stocks.map(
          (stock) => stock.symbol,
        ),
      ).toEqual([
        "IT_STOCK",
        "BANK_STOCK",
      ]);
    });
  });

  describe("Performance", () => {
    it("should filter 5,000 stocks with 5 simultaneous filters in under 200ms", () => {
      const stocks =
        generateMockStocks(5000);

      const filters = [
        createFilter(
          "1",
          "marketCap",
          "gte",
          10000,
        ),
        createFilter(
          "2",
          "pe",
          "between",
          [10, 30],
        ),
        createFilter(
          "3",
          "sector",
          "in",
          ["IT", "Banking"],
        ),
        createFilter(
          "4",
          "roe",
          "gt",
          15,
        ),
        createFilter(
          "5",
          "debtToEquity",
          "lt",
          1.5,
        ),
      ];

      const result = filterStocks(
        stocks,
        filters,
      );

      console.log(
        `5,000 stock filter benchmark: ${result.executionTimeMs.toFixed(2)}ms`,
      );

      expect(
        result.executionTimeMs,
      ).toBeLessThan(200);
    });
  });
});