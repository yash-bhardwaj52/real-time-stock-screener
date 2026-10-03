import { NextResponse } from "next/server";
import { generateMockStocks } from "@/lib/mockDataGenerator";
import type { Stock } from "@/types/stock";

let stockCache: Stock[] | null = null;

export async function GET() {
  const startTime = performance.now();

  try {
    if (!stockCache) {
      stockCache = generateMockStocks(5000);
    }

    const executionTimeMs = Number(
      (performance.now() - startTime).toFixed(2),
    );

    return NextResponse.json({
      success: true,
      data: stockCache,
      meta: {
        total: stockCache.length,
        page: 1,
        pageSize: stockCache.length,
        timestamp: new Date().toISOString(),
        executionTimeMs,
      },
    });
  } catch (error) {
    console.error("Failed to generate stock data:", error);

    return NextResponse.json(
      {
        success: false,
        data: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 0,
          timestamp: new Date().toISOString(),
          executionTimeMs: Number(
            (performance.now() - startTime).toFixed(2),
          ),
        },
        error: {
          code: "STOCK_DATA_ERROR",
          message: "Failed to generate stock data",
        },
      },
      { status: 500 },
    );
  }
}