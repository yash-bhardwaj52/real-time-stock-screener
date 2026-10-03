import type { Stock } from "../src/types/stock";

export interface PriceSimulationResult {
  symbol: string;
  price: number;
  changePercent: number;
  changeAbsolute: number;
  volume: number;
  timestamp: number;
}

/**
 * Generates a standard normal random number.
 * Used by the Geometric Brownian Motion simulation.
 */
export function gaussianRandom(): number {
  const u1 = Math.max(Math.random(), Number.EPSILON);
  const u2 = Math.random();

  return (
    Math.sqrt(-2 * Math.log(u1)) *
    Math.cos(2 * Math.PI * u2)
  );
}

/**
 * Returns market volatility based on Indian market hours.
 *
 * 09:15 - 09:45  -> higher volatility
 * 09:45 - 15:00  -> normal volatility
 * 15:00 - 15:30  -> higher volatility
 * Outside market hours -> low volatility
 */
export function getMarketVolatility(): number {
  const now = new Date();

  const minutes =
    now.getHours() * 60 + now.getMinutes();

  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;

  if (
    minutes < marketOpen ||
    minutes > marketClose
  ) {
    return 0.01;
  }

  const minutesFromOpen =
    minutes - marketOpen;

  const minutesToClose =
    marketClose - minutes;

  if (
    minutesFromOpen <= 30 ||
    minutesToClose <= 30
  ) {
    return 0.04;
  }

  return 0.02;
}

/**
 * Geometric Brownian Motion style price simulation.
 */
export function simulateNextPrice(
  currentPrice: number,
  volatility = getMarketVolatility(),
  drift = 0.0001,
  dt = 1 / 252,
  externalShock = 0,
): number {
  const randomShock =
    Math.sqrt(dt) * gaussianRandom();

  const priceChange =
    drift * dt +
    volatility * randomShock +
    externalShock;

  const nextPrice =
    currentPrice * (1 + priceChange);

  return Math.max(0.01, nextPrice);
}

/**
 * Simulates correlated movement between stocks
 * belonging to the same sector.
 */
export function simulateSectorMovement(
  stocks: Stock[],
  sectorCorrelation = 0.6,
): Map<string, number> {
  const updates = new Map<string, number>();

  const sectorShocks =
    new Map<string, number>();

  // Generate one common market shock per sector.
  for (const stock of stocks) {
    if (!sectorShocks.has(stock.sector)) {
      sectorShocks.set(
        stock.sector,
        gaussianRandom(),
      );
    }
  }

  // Apply sector movement + individual stock noise.
  for (const stock of stocks) {
    const sectorShock =
      sectorShocks.get(stock.sector) ?? 0;

    const idiosyncraticShock =
      gaussianRandom();

    const combinedShock =
      sectorCorrelation *
        sectorShock +
      Math.sqrt(
        1 -
          sectorCorrelation ** 2,
      ) *
        idiosyncraticShock;

    const volatility =
      getMarketVolatility();

    const externalShock =
      volatility *
      Math.sqrt(1 / 252) *
      combinedShock;

    const newPrice =
      simulateNextPrice(
        stock.lastPrice,
        volatility,
        0.0001,
        1 / 252,
        externalShock,
      );

    updates.set(
      stock.symbol,
      newPrice,
    );
  }

  return updates;
}

/**
 * Converts a simulated price into
 * the update payload sent to clients.
 */
export function createPriceUpdate(
  stock: Stock,
  newPrice: number,
): PriceSimulationResult {
  const changeAbsolute =
    newPrice -
    stock.previousClose;

  const changePercent =
    stock.previousClose === 0
      ? 0
      : (changeAbsolute /
          stock.previousClose) *
        100;

  const volumeIncrease =
    Math.floor(
      Math.random() * 5000,
    );

  return {
    symbol: stock.symbol,

    price: Number(
      newPrice.toFixed(2),
    ),

    changePercent: Number(
      changePercent.toFixed(2),
    ),

    changeAbsolute: Number(
      changeAbsolute.toFixed(2),
    ),

    volume:
      stock.volume +
      volumeIncrease,

    timestamp: Date.now(),
  };
}