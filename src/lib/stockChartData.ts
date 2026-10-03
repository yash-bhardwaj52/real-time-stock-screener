import type { Stock } from "@/types/stock";

export interface OHLCVData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function round(
  value: number,
  decimals = 2,
): number {
  const factor = 10 ** decimals;
  return (
    Math.round(value * factor) / factor
  );
}

function getTradingDates(
  count: number,
): Date[] {
  const dates: Date[] = [];
  const current = new Date();

  current.setHours(0, 0, 0, 0);

  while (dates.length < count) {
    const day = current.getDay();

    if (day !== 0 && day !== 6) {
      dates.unshift(
        new Date(current),
      );
    }

    current.setDate(
      current.getDate() - 1,
    );
  }

  return dates;
}

export function generateOHLCV(
  stock: Stock,
  days = 252,
): OHLCVData[] {
  const dates = getTradingDates(days);

  let previousClose =
    stock.lastPrice;

  return dates.map((date) => {
    const volatility =
      0.012 +
      Math.random() * 0.018;

    const open = Math.max(
      1,
      previousClose *
        (1 +
          (Math.random() - 0.5) *
            volatility),
    );

    const close = Math.max(
      1,
      open *
        (1 +
          (Math.random() - 0.5) *
            volatility),
    );

    const high = Math.max(
      open,
      close,
      open *
        (1 +
          Math.random() * 0.02),
    );

    const low = Math.min(
      open,
      close,
      open *
        (1 -
          Math.random() * 0.02),
    );

    const volume = Math.floor(
      stock.avgVolume20D *
        (0.7 +
          Math.random() * 0.8),
    );

    previousClose = close;

    return {
      time: date
        .toISOString()
        .slice(0, 10),
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume,
    };
  });
}

function startOfWeek(
  date: Date,
): string {
  const result = new Date(date);
  const day = result.getDay();

  const diff =
    day === 0 ? -6 : 1 - day;

  result.setDate(
    result.getDate() + diff,
  );

  return result
    .toISOString()
    .slice(0, 10);
}

function startOfMonth(
  date: Date,
): string {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  )
    .toISOString()
    .slice(0, 10);
}

function aggregateCandles(
  data: OHLCVData[],
  getGroupKey: (
    date: Date,
  ) => string,
): OHLCVData[] {
  const groups = new Map<
    string,
    OHLCVData[]
  >();

  data.forEach((candle) => {
    const date = new Date(
      `${candle.time}T00:00:00`,
    );

    const key =
      getGroupKey(date);

    const group =
      groups.get(key) ?? [];

    group.push(candle);
    groups.set(key, group);
  });

  return Array.from(
    groups.entries(),
  ).map(
    ([time, candles]) => ({
      time,
      open: candles[0].open,
      high: Math.max(
        ...candles.map(
          (candle) =>
            candle.high,
        ),
      ),
      low: Math.min(
        ...candles.map(
          (candle) =>
            candle.low,
        ),
      ),
      close:
        candles[candles.length - 1]
          .close,
      volume: candles.reduce(
        (total, candle) =>
          total + candle.volume,
        0,
      ),
    }),
  );
}

export type ChartTimeframe =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "1Y"
  | "5Y";

export function getTimeframeData(
  data: OHLCVData[],
  timeframe: ChartTimeframe,
): OHLCVData[] {
  switch (timeframe) {
    case "1D":
      return data.slice(-1);

    case "1W":
      return aggregateCandles(
        data,
        startOfWeek,
      );

    case "1M":
      return aggregateCandles(
        data,
        startOfMonth,
      );

    case "3M": {
      const monthly =
        aggregateCandles(
          data,
          startOfMonth,
        );

      return monthly.filter(
        (_, index) =>
          index % 3 === 2 ||
          index ===
            monthly.length - 1,
      );
    }

    case "1Y":
      return data;

    case "5Y":
      // The project PDF specifies
      // 252 generated trading days.
      // Therefore we cannot invent
      // additional 5-year history.
      return data;

    default:
      return data;
  }
}