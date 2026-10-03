export interface Stock {
  symbol: string;
  companyName: string;
  sector: Sector;
  industry: string;
  marketCapCategory:
    | "Large Cap"
    | "Mid Cap"
    | "Small Cap"
    | "Micro Cap";
  indexMembership: string[];

  lastPrice: number;
  previousClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  changePercent: number;
  changeAbsolute: number;
  volume: number;
  avgVolume20D: number;
  week52High: number;
  week52Low: number;

  marketCap: number;
  pe: number | null;
  pb: number;
  dividendYield: number;
  eps: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  currentRatio: number;
  promoterHolding: number;
  revenueGrowthYoY: number;
  profitGrowthYoY: number;

  rsi14: number;
  sma50: number;
  sma200: number;
  beta: number;
  atr: number;
  macdSignal: "Bullish" | "Bearish" | "Neutral";
  bollingerPosition: "Above" | "Within" | "Below";
  volumeVsAvg: "Below" | "Above" | "2x" | "3x";
}

export type Sector =
  | "IT"
  | "Banking"
  | "Pharma"
  | "Auto"
  | "FMCG"
  | "Metal"
  | "Energy"
  | "Realty"
  | "Telecom"
  | "Infrastructure"
  | "Media"
  | "Others";

export interface FilterConfig {
  id: string;
  field: keyof Stock;
  operator: FilterOperator;
  value: FilterValue;
  enabled: boolean;
}
export type FieldComparisonOperator =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "eq"
  | "neq";

export interface FieldComparison {
  leftField: keyof Stock;
  operator: FieldComparisonOperator;
  rightField: keyof Stock;
}

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  filters: FilterConfig[];
  comparisons?: FieldComparison[];
}
export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "notIn"
  | "contains"
  | "startsWith";

export type FilterValue =
  | number
  | string
  | boolean
  | number[]
  | string[];