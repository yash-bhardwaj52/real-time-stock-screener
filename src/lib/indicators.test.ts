import { describe, expect, it } from "vitest";

import {
  calculateBollingerBands,
  calculateEMA,
  calculateRSI,
  calculateSMA,
  calculateVolumeProfile,
} from "@/lib/indicators";

import type { OHLCVData } from "@/lib/stockChartData";

function createData(
  closes: number[]
): OHLCVData[] {
  return closes.map((close, index) => ({
    time: `2026-01-${String(index + 1).padStart(2, "0")}`,
    open: close,
    high: close + 2,
    low: close - 2,
    close,
    volume: 1000 + index * 100,
  }));
}

/* ======================================================
   SMA
====================================================== */

describe("SMA", () => {
  it("calculates SMA correctly", () => {
    const data = createData([
      10, 20, 30, 40, 50,
    ]);

    const result = calculateSMA(data, 3);

    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(20);
    expect(result[1].value).toBe(30);
    expect(result[2].value).toBe(40);
  });

  it("returns empty array when data is smaller than period", () => {
    const data = createData([10, 20]);

    const result = calculateSMA(data, 3);

    expect(result).toEqual([]);
  });

  it("returns empty array for invalid period", () => {
    const data = createData([10, 20, 30]);

    expect(calculateSMA(data, 0)).toEqual([]);
  });
});

/* ======================================================
   EMA
====================================================== */

describe("EMA", () => {
  it("calculates initial EMA from first period", () => {
    const data = createData([
      10, 20, 30, 40, 50,
    ]);

    const result = calculateEMA(data, 3);

    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(20);
  });

  it("calculates subsequent EMA values", () => {
    const data = createData([
      10, 20, 30, 40, 50,
    ]);

    const result = calculateEMA(data, 3);

    expect(result[1].value).toBeCloseTo(
      30,
      2
    );

    expect(result[2].value).toBeCloseTo(
      40,
      2
    );
  });
});

/* ======================================================
   BOLLINGER BANDS
====================================================== */

describe("Bollinger Bands", () => {
  it("calculates middle band correctly", () => {
    const data = createData([
      10, 20, 30, 40, 50,
    ]);

    const result =
      calculateBollingerBands(data, 3);

    expect(result).toHaveLength(3);
    expect(result[0].middle).toBe(20);
    expect(result[1].middle).toBe(30);
    expect(result[2].middle).toBe(40);
  });

  it("calculates upper and lower bands", () => {
    const data = createData([
      10, 20, 30,
    ]);

    const result =
      calculateBollingerBands(data, 3);

    expect(result[0].upper).toBeCloseTo(
      36.33,
      2
    );

    expect(result[0].lower).toBeCloseTo(
      3.67,
      2
    );
  });
});

/* ======================================================
   RSI
====================================================== */

describe("RSI", () => {
  it("returns 100 when all movements are gains", () => {
    const data = createData([
      10, 20, 30, 40, 50, 60,
    ]);

    const result = calculateRSI(data, 5);

    expect(result[0].value).toBe(100);
  });

  it("returns 0 when all movements are losses", () => {
    const data = createData([
      60, 50, 40, 30, 20, 10,
    ]);

    const result = calculateRSI(data, 5);

    expect(result[0].value).toBe(0);
  });

  it("keeps RSI within 0 to 100", () => {
    const data = createData([
      10, 20, 15, 25, 18, 30, 22, 35,
    ]);

    const result = calculateRSI(data, 5);

    result.forEach((point) => {
      expect(point.value).toBeGreaterThanOrEqual(
        0
      );

      expect(point.value).toBeLessThanOrEqual(
        100
      );
    });
  });
});

/* ======================================================
   VOLUME PROFILE
====================================================== */

describe("Volume Profile", () => {
  it("creates requested number of bins", () => {
    const data = createData([
      10, 20, 30, 40,
    ]);

    const result =
      calculateVolumeProfile(data, 4);

    expect(result).toHaveLength(4);
  });

  it("keeps total volume", () => {
    const data = createData([
      10, 20, 30,
    ]);

    const result =
      calculateVolumeProfile(data, 3);

    const totalProfileVolume =
      result.reduce(
        (sum, point) =>
          sum + point.volume,
        0
      );

    const totalVolume =
      data.reduce(
        (sum, candle) =>
          sum + candle.volume,
        0
      );

    expect(totalProfileVolume).toBe(
      totalVolume
    );
  });

  it("returns empty array for empty data", () => {
    expect(
      calculateVolumeProfile([], 10)
    ).toEqual([]);
  });

  it("returns one point when price range is zero", () => {
    const data = [
      {
        time: "2026-01-01",
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        volume: 5000,
      },
    ];

    const result =
      calculateVolumeProfile(data, 10);

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(100);
    expect(result[0].volume).toBe(5000);
  });
});