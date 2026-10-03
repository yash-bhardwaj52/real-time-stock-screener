import type { OHLCVData } from "@/lib/stockChartData";

export interface IndicatorPoint {
  time: string;
  value: number;
}

export interface BollingerPoint {
  time: string;
  upper: number;
  middle: number;
  lower: number;
}

export interface VolumeProfilePoint {
  price: number;
  volume: number;
}

function round(
  value: number,
  decimals = 4,
): number {
  const factor = 10 ** decimals;

  return (
    Math.round(value * factor) /
    factor
  );
}

export function calculateSMA(
  data: OHLCVData[],
  period: number,
): IndicatorPoint[] {
  if (
    period <= 0 ||
    data.length < period
  ) {
    return [];
  }

  const result: IndicatorPoint[] = [];

  for (
    let i = period - 1;
    i < data.length;
    i++
  ) {
    const window = data.slice(
      i - period + 1,
      i + 1,
    );

    const average =
      window.reduce(
        (sum, candle) =>
          sum + candle.close,
        0,
      ) / period;

    result.push({
      time: data[i].time,
      value: round(average),
    });
  }

  return result;
}

export function calculateEMA(
  data: OHLCVData[],
  period: number,
): IndicatorPoint[] {
  if (
    period <= 0 ||
    data.length < period
  ) {
    return [];
  }

  const multiplier =
    2 / (period + 1);

  const firstWindow = data.slice(
    0,
    period,
  );

  let ema =
    firstWindow.reduce(
      (sum, candle) =>
        sum + candle.close,
      0,
    ) / period;

  const result: IndicatorPoint[] = [
    {
      time: data[period - 1].time,
      value: round(ema),
    },
  ];

  for (
    let i = period;
    i < data.length;
    i++
  ) {
    ema =
      (data[i].close - ema) *
        multiplier +
      ema;

    result.push({
      time: data[i].time,
      value: round(ema),
    });
  }

  return result;
}

export function calculateBollingerBands(
  data: OHLCVData[],
  period = 20,
  standardDeviations = 2,
): BollingerPoint[] {
  if (
    period <= 0 ||
    data.length < period
  ) {
    return [];
  }

  const result: BollingerPoint[] =
    [];

  for (
    let i = period - 1;
    i < data.length;
    i++
  ) {
    const window = data.slice(
      i - period + 1,
      i + 1,
    );

    const middle =
      window.reduce(
        (sum, candle) =>
          sum + candle.close,
        0,
      ) / period;

    const variance =
      window.reduce(
        (sum, candle) =>
          sum +
          (candle.close -
            middle) **
            2,
        0,
      ) / period;

    const standardDeviation =
      Math.sqrt(variance);

    result.push({
      time: data[i].time,
      middle: round(middle),
      upper: round(
        middle +
          standardDeviations *
            standardDeviation,
      ),
      lower: round(
        middle -
          standardDeviations *
            standardDeviation,
      ),
    });
  }

  return result;
}

export function calculateRSI(
  data: OHLCVData[],
  period = 14,
): IndicatorPoint[] {
  if (
    period <= 0 ||
    data.length <= period
  ) {
    return [];
  }

  let gains = 0;
  let losses = 0;

  for (
    let i = 1;
    i <= period;
    i++
  ) {
    const change =
      data[i].close -
      data[i - 1].close;

    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let averageGain =
    gains / period;
  let averageLoss =
    losses / period;

  const result: IndicatorPoint[] =
    [];

  const calculateRSIValue = () => {
    if (averageLoss === 0) {
      return 100;
    }

    const relativeStrength =
      averageGain / averageLoss;

    return (
      100 -
      100 /
        (1 + relativeStrength)
    );
  };

  result.push({
    time: data[period].time,
    value: round(
      calculateRSIValue(),
    ),
  });

  for (
    let i = period + 1;
    i < data.length;
    i++
  ) {
    const change =
      data[i].close -
      data[i - 1].close;

    const gain =
      change > 0 ? change : 0;

    const loss =
      change < 0 ? -change : 0;

    averageGain =
      (averageGain *
        (period - 1) +
        gain) /
      period;

    averageLoss =
      (averageLoss *
        (period - 1) +
        loss) /
      period;

    result.push({
      time: data[i].time,
      value: round(
        calculateRSIValue(),
      ),
    });
  }

  return result;
}

export function calculateVolumeProfile(
  data: OHLCVData[],
  bins = 24,
): VolumeProfilePoint[] {
  if (
    data.length === 0 ||
    bins <= 0
  ) {
    return [];
  }

  const minPrice = Math.min(
    ...data.map(
      (candle) => candle.low,
    ),
  );

  const maxPrice = Math.max(
    ...data.map(
      (candle) => candle.high,
    ),
  );

  const range =
    maxPrice - minPrice;

  if (range === 0) {
    return [
      {
        price: round(minPrice),
        volume: data.reduce(
          (sum, candle) =>
            sum + candle.volume,
          0,
        ),
      },
    ];
  }

  const binSize =
    range / bins;

  const profile =
    Array.from(
      { length: bins },
      (_, index) => ({
        price:
          minPrice +
          binSize *
            (index + 0.5),
        volume: 0,
      }),
    );

  data.forEach((candle) => {
    const typicalPrice =
      (candle.high +
        candle.low +
        candle.close) /
      3;

    let index = Math.floor(
      (typicalPrice -
        minPrice) /
        binSize,
    );

    index = Math.max(
      0,
      Math.min(
        bins - 1,
        index,
      ),
    );

    profile[index].volume +=
      candle.volume;
  });

  return profile.map(
    (point) => ({
      price: round(point.price),
      volume: point.volume,
    }),
  );
}