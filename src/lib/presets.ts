import type { PresetConfig } from "@/types/stock";
export const screenerPresets: PresetConfig[] = [
  {
    id: "value-stocks",
    name: "Value Stocks",
    description:
      "Low valuation with strong returns and healthy debt levels.",
    filters: [
      {
        id: "preset-value-pe",
        field: "pe",
        operator: "lt",
        value: 15,
        enabled: true,
      },
      {
        id: "preset-value-roe",
        field: "roe",
        operator: "gt",
        value: 15,
        enabled: true,
      },
      {
        id: "preset-value-de",
        field: "debtToEquity",
        operator: "lt",
        value: 0.5,
        enabled: true,
      },
      {
        id: "preset-value-dividend",
        field: "dividendYield",
        operator: "gt",
        value: 2,
        enabled: true,
      },
    ],
  },

  {
    id: "growth-momentum",
    name: "Growth Momentum",
    description:
      "Strong growth combined with healthy RSI momentum.",
    filters: [
      {
        id: "preset-growth-revenue",
        field: "revenueGrowthYoY",
        operator: "gt",
        value: 20,
        enabled: true,
      },
      {
        id: "preset-growth-profit",
        field: "profitGrowthYoY",
        operator: "gt",
        value: 20,
        enabled: true,
      },
      {
        id: "preset-growth-rsi",
        field: "rsi14",
        operator: "between",
        value: [40, 70],
        enabled: true,
      },
    ],
    comparisons: [
      {
        leftField: "lastPrice",
        operator: "gt",
        rightField: "sma50",
      },
    ],
  },

  {
    id: "large-cap-quality",
    name: "Large Cap Quality",
    description:
      "Large companies with strong profitability and promoter ownership.",
    filters: [
      {
        id: "preset-quality-market-cap",
        field: "marketCap",
        operator: "gt",
        value: 20000,
        enabled: true,
      },
      {
        id: "preset-quality-roce",
        field: "roce",
        operator: "gt",
        value: 15,
        enabled: true,
      },
      {
        id: "preset-quality-promoter",
        field: "promoterHolding",
        operator: "gt",
        value: 50,
        enabled: true,
      },
    ],
  },

  {
    id: "technical-breakout",
    name: "Technical Breakout",
    description:
      "Stocks showing strong technical momentum and volume.",
    filters: [
      {
        id: "preset-breakout-rsi",
        field: "rsi14",
        operator: "between",
        value: [50, 70],
        enabled: true,
      },
      {
        id: "preset-breakout-volume",
        field: "volumeVsAvg",
        operator: "in",
        value: ["2x"],
        enabled: true,
      },
      {
        id: "preset-breakout-bollinger",
        field: "bollingerPosition",
        operator: "eq",
        value: "Within",
        enabled: true,
      },
    ],
    comparisons: [
      {
        leftField: "lastPrice",
        operator: "gt",
        rightField: "sma200",
      },
    ],
  },
];

export function getPresetById(
  id: string,
): PresetConfig | undefined {
  return screenerPresets.find(
    (preset) => preset.id === id,
  );
}