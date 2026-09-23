import type { Sector, Stock } from "@/types/stock";

const SECTORS: Record<
  Sector,
  {
    companies: string[];
    avgPE: number;
    avgBeta: number;
  }
> = {
  IT: {
    companies: ["TCS", "Infosys", "Wipro", "HCL Tech", "Tech Mahindra"],
    avgPE: 25,
    avgBeta: 0.8,
  },
  Banking: {
    companies: ["HDFC Bank", "ICICI Bank", "SBI", "Kotak", "Axis Bank"],
    avgPE: 18,
    avgBeta: 1.1,
  },
  Pharma: {
    companies: ["Sun Pharma", "Dr Reddy", "Cipla", "Divi Labs", "Lupin"],
    avgPE: 28,
    avgBeta: 0.9,
  },
  Auto: {
    companies: ["Tata Motors", "Maruti", "M&M", "Bajaj Auto", "Eicher"],
    avgPE: 22,
    avgBeta: 1.0,
  },
  FMCG: {
    companies: ["HUL", "ITC", "Nestle", "Britannia", "Dabur"],
    avgPE: 35,
    avgBeta: 0.7,
  },
  Metal: {
    companies: ["Tata Steel", "JSW Steel", "Hindalco", "Vedanta", "Jindal Steel"],
    avgPE: 15,
    avgBeta: 1.3,
  },
  Energy: {
    companies: ["Reliance", "ONGC", "NTPC", "Power Grid", "Adani Power"],
    avgPE: 20,
    avgBeta: 1.0,
  },
  Realty: {
    companies: ["DLF", "Godrej Properties", "Prestige", "Oberoi Realty"],
    avgPE: 30,
    avgBeta: 1.2,
  },
  Telecom: {
    companies: ["Bharti Airtel", "Vodafone Idea", "Tata Communications"],
    avgPE: 25,
    avgBeta: 1.1,
  },
  Infrastructure: {
    companies: ["L&T", "IRB Infra", "NBCC", "RVNL", "GMR Infra"],
    avgPE: 24,
    avgBeta: 1.15,
  },
  Media: {
    companies: ["Zee Entertainment", "Sun TV", "PVR INOX"],
    avgPE: 26,
    avgBeta: 1.25,
  },
  Others: {
    companies: ["Company A", "Company B", "Company C"],
    avgPE: 20,
    avgBeta: 1.0,
  },
};

const SECTOR_NAMES = Object.keys(SECTORS) as Sector[];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomSector(): Sector {
  return SECTOR_NAMES[
    Math.floor(Math.random() * SECTOR_NAMES.length)
  ];
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function generateMarketCap(): number {
  return round(randomBetween(2_000, 2_000_000), 2);
}

function categoriseByMarketCap(
  marketCap: number,
): Stock["marketCapCategory"] {
  if (marketCap >= 100_000) return "Large Cap";
  if (marketCap >= 20_000) return "Mid Cap";
  if (marketCap >= 5_000) return "Small Cap";
  return "Micro Cap";
}

function generatePrice(marketCap: number): number {
  const basePrice = Math.max(20, Math.sqrt(marketCap) * 8);
  return round(basePrice * randomBetween(0.7, 1.3));
}

function generateSymbol(sector: Sector, index: number): string {
  const companyList = SECTORS[sector].companies;
  const company = companyList[index % companyList.length];

  return `${company
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 8)}${index}`;
}

function generateCompanyName(sector: Sector, index: number): string {
  const companyList = SECTORS[sector].companies;
  const company = companyList[index % companyList.length];

  return `${company} Industries ${index + 1}`;
}

function generateIndustry(sector: Sector): string {
  const industries: Record<Sector, string> = {
    IT: "Information Technology",
    Banking: "Banking",
    Pharma: "Pharmaceuticals",
    Auto: "Automobile",
    FMCG: "Consumer Goods",
    Metal: "Metals",
    Energy: "Energy",
    Realty: "Real Estate",
    Telecom: "Telecommunications",
    Infrastructure: "Infrastructure",
    Media: "Media & Entertainment",
    Others: "Diversified",
  };

  return industries[sector];
}

function assignIndices(marketCap: number): string[] {
  const indices: string[] = [];

  if (marketCap >= 100_000) {
    indices.push("NIFTY 50");
  }

  if (marketCap >= 20_000) {
    indices.push("NIFTY 500");
  }

  return indices;
}

export function generateMockStocks(count: number = 5000): Stock[] {
  const stocks: Stock[] = [];

  for (let i = 0; i < count; i++) {
    const sector = randomSector();
    const sectorInfo = SECTORS[sector];

    const marketCap = generateMarketCap();
    const marketCapCategory = categoriseByMarketCap(marketCap);
    const price = generatePrice(marketCap);

    const previousClose = round(
      price * randomBetween(0.98, 1.02),
    );

    const changeAbsolute = round(price - previousClose);
    const changePercent = round(
      (changeAbsolute / previousClose) * 100,
    );

    const betaAdjustment =
      marketCapCategory === "Large Cap" ? -0.15 : 0.1;

    const beta = round(
      Math.max(
        0.4,
        sectorInfo.avgBeta +
          betaAdjustment +
          randomBetween(-0.15, 0.15),
      ),
    );

    const pe = round(
      Math.max(
        2,
        sectorInfo.avgPE + randomBetween(-8, 8),
      ),
    );

    const pb = round(randomBetween(0.5, 8));
    const eps = round(price / Math.max(pe, 1));

    const roe = round(randomBetween(5, 30));
    const roce = round(randomBetween(6, 32));

    const promoterHolding =
      marketCapCategory === "Large Cap"
        ? round(randomBetween(45, 75))
        : round(randomBetween(35, 70));

    const volume = Math.floor(
      randomBetween(100_000, 10_000_000),
    );

    const avgVolume20D = Math.floor(
      volume * randomBetween(0.7, 1.3),
    );

    const week52Low = round(price * randomBetween(0.65, 0.9));
    const week52High = round(price * randomBetween(1.1, 1.5));

    const rsi14 = round(randomBetween(20, 80));
    const sma50 = round(price * randomBetween(0.85, 1.15));
    const sma200 = round(price * randomBetween(0.75, 1.25));

    stocks.push({
      symbol: generateSymbol(sector, i),
      companyName: generateCompanyName(sector, i),
      sector,
      industry: generateIndustry(sector),

      marketCapCategory,
      indexMembership: assignIndices(marketCap),

      lastPrice: price,
      previousClose,
      dayOpen: round(price * randomBetween(0.98, 1.02)),
      dayHigh: round(price * randomBetween(1.0, 1.04)),
      dayLow: round(price * randomBetween(0.96, 1.0)),
      changePercent,
      changeAbsolute,
      volume,
      avgVolume20D,
      week52High,
      week52Low,

      marketCap,
      pe,
      pb,
      dividendYield: round(randomBetween(0, 5)),
      eps,
      roe,
      roce,
      debtToEquity: round(randomBetween(0, 2.5)),
      currentRatio: round(randomBetween(0.7, 3)),
      promoterHolding,
      revenueGrowthYoY: round(randomBetween(-10, 35)),
      profitGrowthYoY: round(randomBetween(-15, 40)),

      rsi14,
      sma50,
      sma200,
      beta,
      atr: round(price * randomBetween(0.01, 0.05)),
      macdSignal:
        price > sma50
          ? "Bullish"
          : price < sma50
            ? "Bearish"
            : "Neutral",
      bollingerPosition:
        price > sma200
          ? "Above"
          : price < sma50
            ? "Below"
            : "Within",
      volumeVsAvg:
        volume >= avgVolume20D * 3
          ? "3x"
          : volume >= avgVolume20D * 2
            ? "2x"
            : volume >= avgVolume20D
              ? "Above"
              : "Below",
    });
  }

  return stocks;
}