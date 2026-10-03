import { describe, expect, it } from "vitest";

import {
  createFilterPredicate,
  createStockComparisonPredicate,
  filterStocks,
} from "@/lib/filterEngine";

import type {
  FieldComparison,
  FilterConfig,
  Stock,
} from "@/types/stock";

const baseStock: Stock = {
  symbol: "TEST",
  companyName: "Test Company",
  sector: "IT",
  industry: "Software",
  marketCapCategory: "Large Cap",
  indexMembership: ["NIFTY 50"],

  lastPrice: 500,
  previousClose: 490,
  dayOpen: 495,
  dayHigh: 510,
  dayLow: 480,
  changePercent: 2.04,
  changeAbsolute: 10,
  volume: 100000,
  avgVolume20D: 80000,
  week52High: 600,
  week52Low: 350,

  marketCap: 50000,
  pe: 12,
  pb: 3,
  dividendYield: 2.5,
  eps: 40,
  roe: 18,
  roce: 20,
  debtToEquity: 0.3,
  currentRatio: 2,
  promoterHolding: 55,
  revenueGrowthYoY: 25,
  profitGrowthYoY: 30,

  rsi14: 60,
  sma50: 450,
  sma200: 400,
  beta: 1.1,
  atr: 20,
  macdSignal: "Bullish",
  bollingerPosition: "Within",
  volumeVsAvg: "2x",
};

function makeStock(
  overrides: Partial<Stock> = {},
): Stock {
  return {
    ...baseStock,
    ...overrides,
  };
}

describe("Filter Engine", () => {
  it("filters using equality", () => {
    const filter: FilterConfig = {
      id: "sector-it",
      field: "sector",
      operator: "eq",
      value: "IT",
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);

    expect(
      predicate(
        makeStock({
          sector: "Banking",
        }),
      ),
    ).toBe(false);
  });

  it("filters using not equal", () => {
    const filter: FilterConfig = {
      id: "sector-not-it",
      field: "sector",
      operator: "neq",
      value: "IT",
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(false);

    expect(
      predicate(
        makeStock({
          sector: "Banking",
        }),
      ),
    ).toBe(true);
  });

  it("filters using greater than", () => {
    const filter: FilterConfig = {
      id: "roe-greater",
      field: "roe",
      operator: "gt",
      value: 15,
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);

    expect(
      predicate(
        makeStock({
          roe: 15,
        }),
      ),
    ).toBe(false);
  });

  it("filters using greater than or equal", () => {
    const filter: FilterConfig = {
      id: "roe-gte",
      field: "roe",
      operator: "gte",
      value: 18,
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);
  });

  it("filters using less than", () => {
    const filter: FilterConfig = {
      id: "pe-less",
      field: "pe",
      operator: "lt",
      value: 15,
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);
  });

  it("filters using less than or equal", () => {
    const filter: FilterConfig = {
      id: "pe-lte",
      field: "pe",
      operator: "lte",
      value: 12,
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);
  });

  it("filters using between", () => {
    const filter: FilterConfig = {
      id: "rsi-range",
      field: "rsi14",
      operator: "between",
      value: [40, 70],
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);

    expect(
      predicate(
        makeStock({
          rsi14: 71,
        }),
      ),
    ).toBe(false);
  });

  it("includes boundary values in between", () => {
    const filter: FilterConfig = {
      id: "rsi-boundary",
      field: "rsi14",
      operator: "between",
      value: [40, 70],
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(
      predicate(
        makeStock({
          rsi14: 40,
        }),
      ),
    ).toBe(true);

    expect(
      predicate(
        makeStock({
          rsi14: 70,
        }),
      ),
    ).toBe(true);
  });

  it("filters using in", () => {
    const filter: FilterConfig = {
      id: "sector-list",
      field: "sector",
      operator: "in",
      value: ["IT", "Banking"],
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);

    expect(
      predicate(
        makeStock({
          sector: "Pharma",
        }),
      ),
    ).toBe(false);
  });

  it("filters using notIn", () => {
    const filter: FilterConfig = {
      id: "sector-not-list",
      field: "sector",
      operator: "notIn",
      value: ["Pharma", "Auto"],
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);
  });

  it("filters using contains", () => {
    const filter: FilterConfig = {
      id: "company-search",
      field: "companyName",
      operator: "contains",
      value: "test",
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);
  });

  it("filters using startsWith", () => {
    const filter: FilterConfig = {
      id: "symbol-start",
      field: "symbol",
      operator: "startsWith",
      value: "TES",
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(predicate(baseStock)).toBe(true);
  });

  it("handles null PE values", () => {
    const filter: FilterConfig = {
      id: "pe-null",
      field: "pe",
      operator: "lt",
      value: 15,
      enabled: true,
    };

    const predicate =
      createFilterPredicate(filter);

    expect(
      predicate(
        makeStock({
          pe: null,
        }),
      ),
    ).toBe(false);
  });

  it("applies multiple filters using AND logic", () => {
    const filters: FilterConfig[] = [
      {
        id: "pe",
        field: "pe",
        operator: "lt",
        value: 15,
        enabled: true,
      },
      {
        id: "roe",
        field: "roe",
        operator: "gt",
        value: 15,
        enabled: true,
      },
      {
        id: "de",
        field: "debtToEquity",
        operator: "lt",
        value: 0.5,
        enabled: true,
      },
    ];

    const result = filterStocks(
      [baseStock],
      filters,
    );

    expect(result.stocks).toHaveLength(1);
  });

  it("supports field-to-field comparison", () => {
    const comparison: FieldComparison = {
      leftField: "lastPrice",
      operator: "gt",
      rightField: "sma50",
    };

    const predicate =
      createStockComparisonPredicate(
        comparison,
      );

    expect(predicate(baseStock)).toBe(true);

    expect(
      predicate(
        makeStock({
          lastPrice: 400,
          sma50: 450,
        }),
      ),
    ).toBe(false);
  });

  it("combines filters and field comparisons", () => {
    const filters: FilterConfig[] = [
      {
        id: "rsi",
        field: "rsi14",
        operator: "between",
        value: [40, 70],
        enabled: true,
      },
      {
        id: "growth",
        field: "revenueGrowthYoY",
        operator: "gt",
        value: 20,
        enabled: true,
      },
      {
        id: "profit",
        field: "profitGrowthYoY",
        operator: "gt",
        value: 20,
        enabled: true,
      },
    ];

    const comparisons: FieldComparison[] = [
      {
        leftField: "lastPrice",
        operator: "gt",
        rightField: "sma50",
      },
    ];

    const result = filterStocks(
      [baseStock],
      filters,
      [],
      comparisons,
    );

    expect(result.stocks).toHaveLength(1);
  });

  it("ignores disabled filters", () => {
    const filter: FilterConfig = {
      id: "disabled-filter",
      field: "pe",
      operator: "lt",
      value: 1,
      enabled: false,
    };

    const result = filterStocks(
      [baseStock],
      [filter],
    );

    expect(result.stocks).toHaveLength(1);
  });

  it("passes the 5000-stock performance test", () => {
    const stocks = Array.from(
      { length: 5000 },
      (_, index) =>
        makeStock({
          symbol: `TEST${index}`,
          pe: 5 + (index % 20),
          roe: 10 + (index % 20),
          debtToEquity:
            (index % 10) / 10,
          rsi14: 20 + (index % 70),
          marketCap:
            10000 + index * 10,
        }),
    );

    const filters: FilterConfig[] = [
      {
        id: "pe",
        field: "pe",
        operator: "lt",
        value: 15,
        enabled: true,
      },
      {
        id: "roe",
        field: "roe",
        operator: "gt",
        value: 15,
        enabled: true,
      },
      {
        id: "de",
        field: "debtToEquity",
        operator: "lt",
        value: 0.5,
        enabled: true,
      },
      {
        id: "rsi",
        field: "rsi14",
        operator: "between",
        value: [40, 70],
        enabled: true,
      },
      {
        id: "market-cap",
        field: "marketCap",
        operator: "gt",
        value: 20000,
        enabled: true,
      },
    ];

    const result = filterStocks(
      stocks,
      filters,
    );

    expect(
      result.executionTimeMs,
    ).toBeLessThan(200);
  });
    it("validates Value Stocks preset logic", () => {
    const filters: FilterConfig[] = [
      {
        id: "pe",
        field: "pe",
        operator: "lt",
        value: 15,
        enabled: true,
      },
      {
        id: "roe",
        field: "roe",
        operator: "gt",
        value: 15,
        enabled: true,
      },
      {
        id: "de",
        field: "debtToEquity",
        operator: "lt",
        value: 0.5,
        enabled: true,
      },
      {
        id: "dividend",
        field: "dividendYield",
        operator: "gt",
        value: 2,
        enabled: true,
      },
    ];

    const result = filterStocks(
      [
        baseStock,
        makeStock({
          pe: 20,
        }),
      ],
      filters,
    );

    expect(result.stocks).toHaveLength(1);
    expect(result.stocks[0].symbol).toBe(
      "TEST",
    );
  });

  it("validates Growth Momentum preset logic", () => {
    const filters: FilterConfig[] = [
      {
        id: "revenue",
        field: "revenueGrowthYoY",
        operator: "gt",
        value: 20,
        enabled: true,
      },
      {
        id: "profit",
        field: "profitGrowthYoY",
        operator: "gt",
        value: 20,
        enabled: true,
      },
      {
        id: "rsi",
        field: "rsi14",
        operator: "between",
        value: [40, 70],
        enabled: true,
      },
    ];

    const comparisons: FieldComparison[] = [
      {
        leftField: "lastPrice",
        operator: "gt",
        rightField: "sma50",
      },
    ];

    const result = filterStocks(
      [baseStock],
      filters,
      [],
      comparisons,
    );

    expect(result.stocks).toHaveLength(1);
  });

  it("validates Large Cap Quality preset logic", () => {
    const filters: FilterConfig[] = [
      {
        id: "market-cap",
        field: "marketCap",
        operator: "gt",
        value: 20000,
        enabled: true,
      },
      {
        id: "roce",
        field: "roce",
        operator: "gt",
        value: 15,
        enabled: true,
      },
      {
        id: "promoter",
        field: "promoterHolding",
        operator: "gt",
        value: 50,
        enabled: true,
      },
    ];

    const result = filterStocks(
      [baseStock],
      filters,
    );

    expect(result.stocks).toHaveLength(1);
  });

  it("validates Technical Breakout preset logic", () => {
    const filters: FilterConfig[] = [
      {
        id: "rsi",
        field: "rsi14",
        operator: "between",
        value: [50, 70],
        enabled: true,
      },
      {
        id: "volume",
        field: "volumeVsAvg",
        operator: "in",
        value: ["2x"],
        enabled: true,
      },
      {
        id: "bollinger",
        field: "bollingerPosition",
        operator: "eq",
        value: "Within",
        enabled: true,
      },
    ];

    const comparisons: FieldComparison[] = [
      {
        leftField: "lastPrice",
        operator: "gt",
        rightField: "sma200",
      },
    ];

    const result = filterStocks(
      [baseStock],
      filters,
      [],
      comparisons,
    );

    expect(result.stocks).toHaveLength(1);
  });
});