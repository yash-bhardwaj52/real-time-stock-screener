"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";

import {
  calculateBollingerBands,
  calculateEMA,
  calculateRSI,
  calculateSMA,
  calculateVolumeProfile,
} from "@/lib/indicators";

import {
  generateOHLCV,
  getTimeframeData,
  type ChartTimeframe,
  type OHLCVData,
} from "@/lib/stockChartData";

import type { Stock } from "@/types/stock";

interface StockChartProps {
  stock: Stock;
}

interface IndicatorState {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
  ema12: boolean;
  ema26: boolean;
  bollinger: boolean;
  rsi: boolean;
  volumeProfile: boolean;
}

const TIMEFRAMES: ChartTimeframe[] = [
  "1D",
  "1W",
  "1M",
  "3M",
  "1Y",
  "5Y",
];

const DEFAULT_INDICATORS: IndicatorState = {
  sma20: true,
  sma50: true,
  sma200: true,
  ema12: true,
  ema26: true,
  bollinger: true,
  rsi: true,
  volumeProfile: true,
};

function formatNumber(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export default function StockChart({
  stock,
}: StockChartProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const rsiContainerRef =
    useRef<HTMLDivElement | null>(null);

  const chartRef =
    useRef<IChartApi | null>(null);

  const rsiChartRef =
    useRef<IChartApi | null>(null);

  const candleSeriesRef =
    useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [timeframe, setTimeframe] =
    useState<ChartTimeframe>("1Y");

  const [indicators, setIndicators] =
    useState<IndicatorState>(
      DEFAULT_INDICATORS
    );

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: OHLCVData | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

  /*
   * Generate historical data only
   * when selected stock changes.
   */
  const historicalData = useMemo(() => {
    return generateOHLCV(stock, 252);
  }, [stock]);

  const visibleData = useMemo(() => {
    return getTimeframeData(
      historicalData,
      timeframe
    );
  }, [historicalData, timeframe]);

  /*
   * Indicators
   */
  const sma20 = useMemo(
    () => calculateSMA(historicalData, 20),
    [historicalData]
  );

  const sma50 = useMemo(
    () => calculateSMA(historicalData, 50),
    [historicalData]
  );

  const sma200 = useMemo(
    () => calculateSMA(historicalData, 200),
    [historicalData]
  );

  const ema12 = useMemo(
    () => calculateEMA(historicalData, 12),
    [historicalData]
  );

  const ema26 = useMemo(
    () => calculateEMA(historicalData, 26),
    [historicalData]
  );

  const bollinger = useMemo(
    () =>
      calculateBollingerBands(
        historicalData,
        20,
        2
      ),
    [historicalData]
  );

  const rsi = useMemo(
    () => calculateRSI(historicalData, 14),
    [historicalData]
  );

  const volumeProfile = useMemo(
    () =>
      calculateVolumeProfile(
        historicalData,
        24
      ),
    [historicalData]
  );

  /*
   * Volume profile max.
   * Calculate once instead of once per row.
   */
  const maxVolume = useMemo(() => {
    return Math.max(
      ...volumeProfile.map(
        (item) => item.volume
      ),
      0
    );
  }, [volumeProfile]);

  /*
   * =====================================================
   * MAIN CHART
   * =====================================================
   */
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;

    const chart = createChart(container, {
      width: Math.max(
        container.clientWidth,
        280
      ),

      height: 400,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "#030712",
        },

        textColor: "#9ca3af",
      },

      grid: {
        vertLines: {
          color: "#1f2937",
        },

        horzLines: {
          color: "#1f2937",
        },
      },

      rightPriceScale: {
        borderColor: "#374151",

        minimumWidth: 65,
      },

      timeScale: {
        borderColor: "#374151",
        timeVisible: false,
      },

      crosshair: {
        mode: CrosshairMode.Normal,

        vertLine: {
          color: "#6b7280",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },

        horzLine: {
          color: "#6b7280",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
      },

      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },

      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
        axisDoubleClickReset: true,
      },
    });

    chartRef.current = chart;

    /*
     * Candlestick
     */
    const candleSeries =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor: "#22c55e",
          downColor: "#ef4444",

          borderUpColor: "#22c55e",
          borderDownColor: "#ef4444",

          wickUpColor: "#22c55e",
          wickDownColor: "#ef4444",
        }
      );

    candleSeriesRef.current =
      candleSeries;

    const candleData: CandlestickData<Time>[] =
      visibleData.map((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

    candleSeries.setData(candleData);

    /*
     * Helper
     */
    const addLineSeries = (
      data: Array<{
        time: string;
        value: number;
      }>,
      color: string,
      lineWidth: 1 | 2 | 3 | 4
    ) => {
      const series =
        chart.addSeries(
          LineSeries,
          {
            color,
            lineWidth,
            priceLineVisible: false,
            lastValueVisible: false,
          }
        );

      const visibleTimes =
        new Set(
          visibleData.map(
            (item) => item.time
          )
        );

      series.setData(
        data
          .filter((item) =>
            visibleTimes.has(item.time)
          )
          .map((item) => ({
            time: item.time as Time,
            value: item.value,
          }))
      );

      return series;
    };

    /*
     * SMA
     */
    if (indicators.sma20) {
      addLineSeries(
        sma20,
        "#f59e0b",
        2
      );
    }

    if (indicators.sma50) {
      addLineSeries(
        sma50,
        "#3b82f6",
        2
      );
    }

    if (indicators.sma200) {
      addLineSeries(
        sma200,
        "#a855f7",
        2
      );
    }

    /*
     * EMA
     */
    if (indicators.ema12) {
      addLineSeries(
        ema12,
        "#06b6d4",
        2
      );
    }

    if (indicators.ema26) {
      addLineSeries(
        ema26,
        "#ec4899",
        2
      );
    }

    /*
     * Bollinger Bands
     */
    if (indicators.bollinger) {
      const visibleTimes =
        new Set(
          visibleData.map(
            (item) => item.time
          )
        );

      const upperSeries =
        chart.addSeries(
          LineSeries,
          {
            color: "#94a3b8",
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          }
        );

      const middleSeries =
        chart.addSeries(
          LineSeries,
          {
            color: "#64748b",
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          }
        );

      const lowerSeries =
        chart.addSeries(
          LineSeries,
          {
            color: "#94a3b8",
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          }
        );

      upperSeries.setData(
        bollinger
          .filter((item) =>
            visibleTimes.has(item.time)
          )
          .map((item) => ({
            time: item.time as Time,
            value: item.upper,
          }))
      );

      middleSeries.setData(
        bollinger
          .filter((item) =>
            visibleTimes.has(item.time)
          )
          .map((item) => ({
            time: item.time as Time,
            value: item.middle,
          }))
      );

      lowerSeries.setData(
        bollinger
          .filter((item) =>
            visibleTimes.has(item.time)
          )
          .map((item) => ({
            time: item.time as Time,
            value: item.lower,
          }))
      );
    }

    chart.timeScale().fitContent();

    /*
     * Crosshair tooltip
     */
    const handleCrosshairMove = (param: {
      point?: {
        x: number;
        y: number;
      };

      time?: Time;
    }) => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        setTooltip((current) => ({
          ...current,
          visible: false,
        }));

        return;
      }

      const timeString =
        String(param.time);

      const candle =
        visibleData.find(
          (item) =>
            item.time === timeString
        );

      if (!candle) {
        setTooltip((current) => ({
          ...current,
          visible: false,
        }));

        return;
      }

      setTooltip({
        visible: true,
        x: param.point.x,
        y: param.point.y,
        data: candle,
      });
    };

    chart.subscribeCrosshairMove(
      handleCrosshairMove
    );

    /*
     * Double click reset
     */
    const handleDoubleClick = () => {
      chart.timeScale().fitContent();
    };

    container.addEventListener(
      "dblclick",
      handleDoubleClick
    );

    /*
     * Responsive resize
     */
    const resizeObserver =
      new ResizeObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry) {
            return;
          }

          const width =
            Math.max(
              entry.contentRect.width,
              280
            );

          chart.applyOptions({
            width,
            height: 400,
          });
        }
      );

    resizeObserver.observe(container);

    /*
     * Cleanup
     */
    return () => {
      chart.unsubscribeCrosshairMove(
        handleCrosshairMove
      );

      container.removeEventListener(
        "dblclick",
        handleDoubleClick
      );

      resizeObserver.disconnect();

      chart.remove();

      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [
    visibleData,
    indicators,
    sma20,
    sma50,
    sma200,
    ema12,
    ema26,
    bollinger,
  ]);

  /*
   * =====================================================
   * RSI CHART
   * =====================================================
   */
  useEffect(() => {
    if (
      !rsiContainerRef.current ||
      !indicators.rsi
    ) {
      return;
    }

    const container =
      rsiContainerRef.current;

    const chart = createChart(
      container,
      {
        width: Math.max(
          container.clientWidth,
          280
        ),

        height: 130,

        layout: {
          background: {
            type: ColorType.Solid,
            color: "#030712",
          },

          textColor: "#9ca3af",
        },

        grid: {
          vertLines: {
            color: "#1f2937",
          },

          horzLines: {
            color: "#1f2937",
          },
        },

        rightPriceScale: {
          borderColor: "#374151",

          minimumWidth: 45,

          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },

        timeScale: {
          borderColor: "#374151",
          timeVisible: false,
        },

        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },

        handleScale: {
          mouseWheel: true,
          pinch: true,
          axisPressedMouseMove: true,
          axisDoubleClickReset: true,
        },
      }
    );

    rsiChartRef.current = chart;

    const visibleTimes =
      new Set(
        visibleData.map(
          (item) => item.time
        )
      );

    const rsiSeries =
      chart.addSeries(
        LineSeries,
        {
          color: "#8b5cf6",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        }
      );

    rsiSeries.setData(
      rsi
        .filter((item) =>
          visibleTimes.has(item.time)
        )
        .map((item) => ({
          time: item.time as Time,
          value: item.value,
        }))
    );

    /*
     * RSI levels
     */
    rsiSeries.createPriceLine({
      price: 70,
      color: "#ef4444",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "70",
    });

    rsiSeries.createPriceLine({
      price: 30,
      color: "#22c55e",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "30",
    });

    rsiSeries.createPriceLine({
      price: 50,
      color: "#6b7280",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: false,
      title: "",
    });

    chart.timeScale().fitContent();

    const resizeObserver =
      new ResizeObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry) {
            return;
          }

          chart.applyOptions({
            width: Math.max(
              entry.contentRect.width,
              280
            ),

            height: 130,
          });
        }
      );

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();

      chart.remove();

      rsiChartRef.current = null;
    };
  }, [
    rsi,
    visibleData,
    indicators.rsi,
  ]);

  /*
   * Indicator toggle
   */
  const toggleIndicator = (
    key: keyof IndicatorState
  ) => {
    setIndicators((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="min-w-0 w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-950 p-3 sm:p-4">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-3 min-w-0 border-b border-gray-800 pb-3">
        <div className="flex min-w-0 items-start justify-between gap-3">

          {/* Stock information */}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="shrink-0 text-base font-semibold text-white sm:text-lg">
                {stock.symbol}
              </h2>

              <span
                className="min-w-0 break-words text-xs text-gray-500"
                title={stock.companyName}
              >
                {stock.companyName}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">
                ₹{formatNumber(stock.lastPrice)}
              </span>

              <span
                className={`text-xs font-medium ${
                  stock.changePercent >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {stock.changePercent >= 0
                  ? "+"
                  : ""}
                {stock.changePercent.toFixed(
                  2
                )}
                %
              </span>
            </div>
          </div>

          {/* Timeframes */}
          <div className="max-w-full shrink-0 overflow-x-auto">
            <div className="flex w-max items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 p-1">
              {TIMEFRAMES.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setTimeframe(item)
                    }
                    className={`rounded-md px-2 py-1.5 text-[11px] font-medium transition sm:px-2.5 ${
                      timeframe === item
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* INDICATOR TOOLBAR */}
      {/* ================================================= */}

      <div className="mb-3 min-w-0 rounded-lg border border-gray-800 bg-gray-900 p-2.5">

        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Indicators
          </div>

          <div className="hidden text-[10px] text-gray-600 xl:block">
            Scroll = Zoom • Drag = Pan • Double-click = Reset
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["sma20", "SMA 20"],
              ["sma50", "SMA 50"],
              ["sma200", "SMA 200"],
              ["ema12", "EMA 12"],
              ["ema26", "EMA 26"],
              ["bollinger", "Bollinger"],
              ["rsi", "RSI 14"],
              ["volumeProfile", "Volume Profile"],
            ] as Array<
              [
                keyof IndicatorState,
                string
              ]
            >
          ).map(
            ([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  toggleIndicator(key)
                }
                className={`rounded-md border px-2 py-1.5 text-[10px] transition sm:px-2.5 sm:text-xs ${
                  indicators[key]
                    ? "border-blue-500 bg-blue-600/20 text-blue-300"
                    : "border-gray-700 bg-gray-950 text-gray-500"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* MAIN CHART */}
      {/* ================================================= */}

      <div
        ref={containerRef}
        className="relative min-w-0 w-full overflow-hidden"
      >
        {tooltip.visible &&
          tooltip.data && (
            <div
              className="pointer-events-none absolute z-20 max-w-[180px] rounded-lg border border-gray-700 bg-gray-900/95 px-3 py-2 text-[10px] shadow-xl sm:text-xs"
              style={{
                left: Math.min(
                  tooltip.x + 15,
                  Math.max(
                    10,
                    containerRef.current
                      ? containerRef.current
                          .clientWidth - 190
                      : tooltip.x + 15
                  )
                ),

                top: Math.min(
                  tooltip.y + 15,
                  300
                ),
              }}
            >
              <div className="mb-2 font-semibold text-white">
                {tooltip.data.time}
              </div>

              <div className="space-y-1 text-gray-400">
                <div>
                  Open:{" "}
                  <span className="text-white">
                    {tooltip.data.open.toFixed(
                      2
                    )}
                  </span>
                </div>

                <div>
                  High:{" "}
                  <span className="text-white">
                    {tooltip.data.high.toFixed(
                      2
                    )}
                  </span>
                </div>

                <div>
                  Low:{" "}
                  <span className="text-white">
                    {tooltip.data.low.toFixed(
                      2
                    )}
                  </span>
                </div>

                <div>
                  Close:{" "}
                  <span className="text-white">
                    {tooltip.data.close.toFixed(
                      2
                    )}
                  </span>
                </div>

                <div>
                  Volume:{" "}
                  <span className="text-white">
                    {tooltip.data.volume.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* ================================================= */}
      {/* VOLUME PROFILE */}
      {/* ================================================= */}

      {indicators.volumeProfile && (
        <div className="mt-3 min-w-0 overflow-hidden rounded-lg border border-gray-800 bg-gray-900 p-2.5">

          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Volume Profile
          </div>

          <div className="space-y-1">
            {volumeProfile.map(
              (point) => {
                const width =
                  maxVolume === 0
                    ? 0
                    : (point.volume /
                        maxVolume) *
                      100;

                return (
                  <div
                    key={`${point.price}-${point.volume}`}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    <span className="w-14 shrink-0 text-right text-[9px] text-gray-500 sm:w-16 sm:text-[10px]">
                      {point.price.toFixed(
                        2
                      )}
                    </span>

                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded bg-gray-800">
                      <div
                        className="h-full rounded bg-blue-500/70"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <span className="w-16 shrink-0 text-[9px] text-gray-500 sm:w-20 sm:text-[10px]">
                      {point.volume.toLocaleString()}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* RSI */}
      {/* ================================================= */}

      {indicators.rsi && (
        <div className="mt-3 min-w-0 overflow-hidden rounded-lg border border-gray-800 bg-gray-950">

          <div className="border-b border-gray-800 px-3 py-1.5">
            <span className="text-[11px] font-semibold text-gray-400">
              RSI 14
            </span>
          </div>

          <div
            ref={rsiContainerRef}
            className="min-w-0 w-full"
          />
        </div>
      )}

      {/* ================================================= */}
      {/* HELP */}
      {/* ================================================= */}

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-gray-800 pt-2 text-[10px] text-gray-600">
        <span>🖱️ Scroll: Zoom</span>
        <span>✋ Drag: Pan</span>
        <span>⤢ Pinch: Zoom</span>
        <span>↻ Double-click: Reset</span>
      </div>
    </div>
  );
}