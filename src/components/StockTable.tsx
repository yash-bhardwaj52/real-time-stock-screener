"use client";



import {
  
  useEffect,

  useRef,

  useState,

  type CSSProperties,

} from "react";



import { useVirtualizer } from "@tanstack/react-virtual";



import {

  flexRender,

  getCoreRowModel,

  getSortedRowModel,

  useReactTable,

} from "@tanstack/react-table";



import type {
Cell,
  Column,

  ColumnDef,

  ColumnPinningState,

  SortingState,

} from "@tanstack/react-table";



import { useStockStore } from "@/store/stockstore";



import type { Stock } from "@/types/stock";



/* ======================================================

   PINNING

====================================================== */



const getCommonPinningStyles = (

  column: Column<Stock>,

): CSSProperties => {

  const isPinned = column.getIsPinned();



  return {

    left:

      isPinned === "left"

        ? `${column.getStart("left")}px`

        : undefined,



    position: isPinned

      ? "sticky"

      : "relative",



    zIndex: isPinned ? 2 : 0,



    background: isPinned

      ? "#111827"

      : undefined,



    boxShadow:

      isPinned === "left" &&

        column.getIsLastColumn("left")

        ? "4px 0 4px -4px rgba(0,0,0,0.5) inset"

        : undefined,

  };

};



/* ======================================================

   LIVE PRICE CELL

====================================================== */



type LiveField =

  | "lastPrice"

  | "changePercent"

  | "changeAbsolute"

  | "volume";



interface LivePriceCellProps {

  symbol: string;

  field: LiveField;

  fallback: unknown;

}



function LivePriceCell({

  symbol,

  field,

  fallback,

}: LivePriceCellProps) {

  const livePrice = useStockStore(

    (state) => state.livePrices.get(symbol),

  );



  const previousValueRef =

    useRef<number | null>(null);



  const [flash, setFlash] = useState<

    "up" | "down" | null

  >(null);



  useEffect(() => {

    if (!livePrice) {

      return;

    }



    const currentValue =

      field === "lastPrice"

        ? livePrice.price

        : field === "changePercent"

          ? livePrice.changePercent

          : field === "changeAbsolute"

            ? livePrice.change

            : livePrice.price;



    const previousValue =

      previousValueRef.current;



    if (

      previousValue !== null &&

      currentValue !== previousValue

    ) {

      setFlash(

        currentValue > previousValue

          ? "up"

          : "down",

      );



      const timer = setTimeout(() => {

        setFlash(null);

      }, 450);



      previousValueRef.current =

        currentValue;



      return () => {

        clearTimeout(timer);

      };

    }



    previousValueRef.current =

      currentValue;

  }, [

    livePrice?.updatedAt,

    field,

    livePrice,

  ]);



  if (!livePrice) {

    return (

      <span>

        {fallback === null ||

          fallback === undefined

          ? "-"

          : String(fallback)}

      </span>

    );

  }



  let value: number;



  switch (field) {

    case "lastPrice":

      value = livePrice.price;

      break;



    case "changePercent":

      value =

        livePrice.changePercent;

      break;



    case "changeAbsolute":

      value = livePrice.change;

      break;



    case "volume":

      value = livePrice.price;

      break;

  }



  const formattedValue =

    field === "volume"

      ? value.toLocaleString()

      : field === "changePercent"

        ? `${value.toFixed(2)}%`

        : value.toFixed(2);



  return (

    <span

      className={`

        inline-block

        rounded

        px-1

        transition-all

        duration-300

        ${flash === "up"

          ? "animate-pulse bg-green-500/30 text-green-300"

          : ""

        }

        ${flash === "down"

          ? "animate-pulse bg-red-500/30 text-red-300"

          : ""

        }

      `}

    >

      {formattedValue}

    </span>

  );

}



/* ======================================================

   COLUMNS

====================================================== */



const STOCK_COLUMNS: ColumnDef<Stock>[] = [

  {

    accessorKey: "symbol",

    header: "Symbol",

    size: 140,

    minSize: 120,

  },

  {

    accessorKey: "companyName",

    header: "Company",

    size: 240,

    minSize: 200,

  },

  {

    accessorKey: "sector",

    header: "Sector",

    size: 130,

    minSize: 110,

  },

  {

    accessorKey: "industry",

    header: "Industry",

    size: 190,

    minSize: 150,

  },

  {

    accessorKey: "marketCapCategory",

    header: "Market Cap Category",

    size: 180,

    minSize: 160,

  },

  {

    accessorKey: "indexMembership",

    header: "Index",

    size: 150,

    minSize: 120,

  },

  {

    accessorKey: "lastPrice",

    header: "Price",

    size: 110,

  },

  {

    accessorKey: "previousClose",

    header: "Previous Close",

    size: 130,

  },

  {

    accessorKey: "dayOpen",

    header: "Day Open",

    size: 110,

  },

  {

    accessorKey: "dayHigh",

    header: "Day High",

    size: 110,

  },

  {

    accessorKey: "dayLow",

    header: "Day Low",

    size: 110,

  },

  {

    accessorKey: "changePercent",

    header: "Change %",

    size: 110,

  },

  {

    accessorKey: "changeAbsolute",

    header: "Change",

    size: 110,

  },

  {

    accessorKey: "volume",

    header: "Volume",

    size: 130,

  },

  {

    accessorKey: "avgVolume20D",

    header: "Avg Volume 20D",

    size: 140,

  },

  {

    accessorKey: "week52High",

    header: "52W High",

    size: 110,

  },

  {

    accessorKey: "week52Low",

    header: "52W Low",

    size: 110,

  },

  {

    accessorKey: "marketCap",

    header: "Market Cap",

    size: 130,

  },

  {

    accessorKey: "pe",

    header: "P/E",

    size: 90,

  },

  {

    accessorKey: "pb",

    header: "P/B",

    size: 90,

  },

  {

    accessorKey: "dividendYield",

    header: "Dividend Yield",

    size: 130,

  },

  {

    accessorKey: "eps",

    header: "EPS",

    size: 90,

  },

  {

    accessorKey: "roe",

    header: "ROE",

    size: 90,

  },

  {

    accessorKey: "roce",

    header: "ROCE",

    size: 90,

  },

  {

    accessorKey: "debtToEquity",

    header: "Debt / Equity",

    size: 130,

  },

  {

    accessorKey: "currentRatio",

    header: "Current Ratio",

    size: 120,

  },

  {

    accessorKey: "promoterHolding",

    header: "Promoter Holding",

    size: 150,

  },

  {

    accessorKey: "revenueGrowthYoY",

    header: "Revenue Growth YoY",

    size: 160,

  },

  {

    accessorKey: "profitGrowthYoY",

    header: "Profit Growth YoY",

    size: 160,

  },

  {

    accessorKey: "rsi14",

    header: "RSI 14",

    size: 90,

  },

  {

    accessorKey: "sma50",

    header: "SMA 50",

    size: 100,

  },

  {

    accessorKey: "sma200",

    header: "SMA 200",

    size: 100,

  },

  {

    accessorKey: "beta",

    header: "Beta",

    size: 90,

  },

  {

    accessorKey: "atr",

    header: "ATR",

    size: 90,

  },

  {

    accessorKey: "macdSignal",

    header: "MACD Signal",

    size: 130,

  },

  {

    accessorKey: "bollingerPosition",

    header: "Bollinger Position",

    size: 170,

  },

  {

    accessorKey: "volumeVsAvg",

    header: "Volume vs Avg",

    size: 140,

  },

];



/* ======================================================

   TYPES

====================================================== */



interface StockTableProps {

  data: Stock[];

}



/* ======================================================

   COMPONENT

====================================================== */



export default function StockTable({

  data,

}: StockTableProps) {

  const [sorting, setSorting] =

    useState<SortingState>([]);



  const [columnPinning, setColumnPinning] =

    useState<ColumnPinningState>({

      left: ["symbol"],

    });



  const [rowIndex, setRowIndex] =

    useState("");



  const [contextMenu, setContextMenu] =

    useState<{

      x: number;

      y: number;

      columnId: string;

    } | null>(null);



  const [sortTime, setSortTime] =

    useState<number | null>(null);



  const [scrollFPS, setScrollFPS] =

    useState<number | null>(null);



  const parentRef =

    useRef<HTMLDivElement>(null);



  const sortStartRef =

    useRef<number | null>(null);



  const fpsStartTimeRef =

    useRef<number | null>(null);



  const fpsFrameCountRef =

    useRef(0);



  const fpsAnimationRef =

    useRef<number | null>(null);



  const scrollStopTimeoutRef =

    useRef<ReturnType<

      typeof setTimeout

    > | null>(null);



  /* ======================================================

     CLOSE CONTEXT MENU

  ====================================================== */



  useEffect(() => {

    const handleClick = () => {

      setContextMenu(null);

    };



    document.addEventListener(

      "click",

      handleClick,

    );



    return () => {

      document.removeEventListener(

        "click",

        handleClick,

      );

    };

  }, []);



  /* ======================================================

     SORT PERFORMANCE

  ====================================================== */



  useEffect(() => {

    if (sortStartRef.current === null) {

      return;

    }



    const startTime =

      sortStartRef.current;



    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        const duration =

          performance.now() -

          startTime;



        setSortTime(duration);



        console.warn(

          `[A2.3] Sort Response Time: ${duration.toFixed(

            2,

          )} ms`,

        );



        if (duration < 150) {

          console.warn(

            "[A2.3] Sort Benchmark: PASS (< 150 ms)",

          );

        } else {

          console.warn(

            "[A2.3] Sort Benchmark: FAIL (>= 150 ms)",

          );

        }



        sortStartRef.current = null;

      });

    });

  }, [sorting]);



  /* ======================================================

     SCROLL FPS

  ====================================================== */



  const measureScrollFPS = () => {

    if (

      fpsStartTimeRef.current ===

      null

    ) {

      fpsStartTimeRef.current =

        performance.now();



      fpsFrameCountRef.current = 0;

    }



    fpsFrameCountRef.current += 1;



    const currentTime =

      performance.now();



    const elapsed =

      currentTime -

      fpsStartTimeRef.current;



    if (elapsed >= 1000) {

      const fps =

        (fpsFrameCountRef.current /

          elapsed) *

        1000;



      setScrollFPS(fps);



      console.warn(

        `[A2.3] Scroll FPS: ${fps.toFixed(

          2,

        )} FPS`,

      );



      if (fps > 55) {

        console.warn(

          "[A2.3] Scroll FPS Benchmark: PASS (> 55 FPS)",

        );

      } else {

        console.warn(

          "[A2.3] Scroll FPS Benchmark: BELOW TARGET (<= 55 FPS)",

        );

      }



      fpsStartTimeRef.current = null;

      fpsFrameCountRef.current = 0;



      if (

        fpsAnimationRef.current !==

        null

      ) {

        cancelAnimationFrame(

          fpsAnimationRef.current,

        );



        fpsAnimationRef.current = null;

      }



      return;

    }



    fpsAnimationRef.current =

      requestAnimationFrame(

        measureScrollFPS,

      );

  };



  /* ======================================================

     SCROLL HANDLER

  ====================================================== */



  const handleScroll = () => {

    if (

      fpsAnimationRef.current === null

    ) {

      measureScrollFPS();

    }



    if (

      scrollStopTimeoutRef.current !==

      null

    ) {

      clearTimeout(

        scrollStopTimeoutRef.current,

      );

    }



    scrollStopTimeoutRef.current =

      setTimeout(() => {

        if (

          fpsAnimationRef.current !==

          null

        ) {

          cancelAnimationFrame(

            fpsAnimationRef.current,

          );



          fpsAnimationRef.current = null;

        }



        fpsStartTimeRef.current = null;

        fpsFrameCountRef.current = 0;

      }, 1500);

  };



  /* ======================================================

     CLEANUP

  ====================================================== */



  useEffect(() => {

    return () => {

      if (

        fpsAnimationRef.current !==

        null

      ) {

        cancelAnimationFrame(

          fpsAnimationRef.current,

        );

      }



      if (

        scrollStopTimeoutRef.current !==

        null

      ) {

        clearTimeout(

          scrollStopTimeoutRef.current,

        );

      }

    };

  }, []);



  /* ======================================================

     ZUSTAND

  ====================================================== */



  const selectedSymbol =

    useStockStore(

      (state) => state.selectedSymbol,

    );



  const setSelectedSymbol =

    useStockStore(

      (state) =>

        state.setSelectedSymbol,

    );



  /* ======================================================

     TABLE

  ====================================================== */



  const table = useReactTable({

    data,

    columns: STOCK_COLUMNS,



    state: {

      sorting,

      columnPinning,

    },



    onSortingChange: (updater) => {

      sortStartRef.current =

        performance.now();



      setSorting(updater);

    },



    onColumnPinningChange:

      setColumnPinning,



    getCoreRowModel:

      getCoreRowModel(),



    getSortedRowModel:

      getSortedRowModel(),



    enableColumnResizing: true,



    columnResizeMode: "onChange",

  });



  const rows =

    table.getRowModel().rows;



  /* ======================================================

     VIRTUALIZATION

  ====================================================== */



  const rowVirtualizer =

    useVirtualizer({

      count: rows.length,



      getScrollElement: () =>

        parentRef.current,



      estimateSize: () => 36,



      overscan: 10,

    });



  const virtualRows =

    rowVirtualizer.getVirtualItems();



  /* ======================================================

     SCROLL TO ROW

  ====================================================== */



  const scrollToRow = (

    index: number,

  ) => {

    rowVirtualizer.scrollToIndex(

      index,

      {

        align: "center",

        behavior: "smooth",

      },

    );

  };



  /* ======================================================

     LIVE CELL RENDER

  ====================================================== */



  const renderCellValue = (
    cell: Cell<Stock, unknown>,
  ) => {

    const field =

      cell.column

        .id as LiveField;



    const isLiveField =

      field === "lastPrice" ||

      field ===

      "changePercent" ||

      field ===

      "changeAbsolute" ||

      field === "volume";



    if (isLiveField) {

      return (

        <LivePriceCell

          symbol={

            cell.row.original.symbol

          }

          field={field}

          fallback={cell.getValue()}

        />

      );

    }



    return (

      cell.getValue() === null ||

        cell.getValue() ===

        undefined

        ? "-"

        : flexRender(

          cell.column

            .columnDef.cell,

          cell.getContext(),

        )

    );

  };



  /* ======================================================

     UI

  ====================================================== */



  return (

    <div className="w-full">



      {/* CONTEXT MENU */}



      {contextMenu && (

        <div

          className="fixed z-50 rounded-md border border-gray-700 bg-gray-900 p-2 text-sm text-white shadow-lg"

          style={{

            left: contextMenu.x,

            top: contextMenu.y,

          }}

          onClick={(event) =>

            event.stopPropagation()

          }

        >

          <button

            onClick={() => {

              setColumnPinning(

                (previous) => {

                  const current =

                    previous.left ?? [];



                  if (

                    current.includes(

                      contextMenu.columnId,

                    )

                  ) {

                    return previous;

                  }



                  return {

                    ...previous,

                    left: [

                      ...current,

                      contextMenu.columnId,

                    ],

                  };

                },

              );



              setContextMenu(null);

            }}

            className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800"

          >

            Pin left

          </button>



          <button

            onClick={() => {

              setColumnPinning(

                (previous) => ({

                  ...previous,

                  left: (

                    previous.left ?? []

                  ).filter(

                    (id) =>

                      id !==

                      contextMenu.columnId,

                  ),

                }),

              );



              setContextMenu(null);

            }}

            className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800"

          >

            Unpin

          </button>

        </div>

      )}



      {/* SORT RESULT */}



      {sortTime !== null && (

        <div

          className={`mb-3 rounded-lg border px-4 py-3 text-sm ${sortTime < 150

              ? "border-green-700 bg-green-950 text-green-300"

              : "border-red-700 bg-red-950 text-red-300"

            }`}

        >

          <strong>

            Sort Response Time:

          </strong>{" "}

          {sortTime.toFixed(2)} ms



          <span className="ml-3">

            {sortTime < 150

              ? "✓ PASS — Target < 150 ms"

              : "✗ FAIL — Target < 150 ms"}

          </span>

        </div>

      )}



      {/* FPS RESULT */}



      {scrollFPS !== null && (

        <div

          className={`mb-3 rounded-lg border px-4 py-3 text-sm ${scrollFPS > 55

              ? "border-green-700 bg-green-950 text-green-300"

              : "border-red-700 bg-red-950 text-red-300"

            }`}

        >

          <strong>

            Scroll FPS:

          </strong>{" "}

          {scrollFPS.toFixed(2)} FPS



          <span className="ml-3">

            {scrollFPS > 55

              ? "✓ PASS — Target > 55 FPS"

              : "✗ BELOW TARGET — Target > 55 FPS"}

          </span>

        </div>

      )}



      {/* ROW NAVIGATION */}



      <div className="mb-3 flex items-center gap-2">

        <input

          type="number"

          min="0"

          max={Math.max(

            0,

            rows.length - 1,

          )}

          value={rowIndex}

          onChange={(event) =>

            setRowIndex(

              event.target.value,

            )

          }

          placeholder="Row index"

          className="w-32 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none"

        />



        <button

          onClick={() => {

            const index =

              Number(rowIndex);



            if (

              rowIndex !== "" &&

              index >= 0 &&

              index < rows.length

            ) {

              scrollToRow(index);

            }

          }}

          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"

        >

          Go to Row

        </button>

      </div>



      {/* TABLE */}



      <div

        ref={parentRef}

        onScroll={handleScroll}

        className="

          w-full

          max-h-[600px]

          overflow-auto

          rounded-lg

          border

          border-gray-700

        "

      >

        <table

          className="border-collapse text-sm"

          style={{

            width:

              table.getTotalSize(),

            minWidth: "100%",

          }}

        >

          {/* HEADER */}



          <thead className="bg-gray-900">

            {table

              .getHeaderGroups()

              .map(

                (headerGroup) => (

                  <tr

                    key={

                      headerGroup.id

                    }

                  >

                    {headerGroup.headers.map(

                      (header) => (

                        <th

                          key={

                            header.id

                          }

                          onContextMenu={(

                            event,

                          ) => {

                            event.preventDefault();



                            if (

                              header

                                .column

                                .id ===

                              "symbol"

                            ) {

                              return;

                            }



                            setContextMenu(

                              {

                                x: event.clientX,

                                y: event.clientY,

                                columnId:

                                  header

                                    .column

                                    .id,

                              },

                            );

                          }}

                          className="

                            sticky

                            top-0

                            z-10

                            border-b

                            border-gray-700

                            bg-gray-900

                            px-4

                            py-3

                            text-left

                            font-semibold

                            text-white

                            whitespace-nowrap

                          "

                          style={{

                            ...getCommonPinningStyles(

                              header.column,

                            ),

                            width:

                              header.getSize(),

                          }}

                        >

                          <div

                            className="cursor-pointer select-none hover:text-blue-400"

                            onClick={header

                              .column

                              .getToggleSortingHandler()}

                          >

                            {flexRender(

                              header

                                .column

                                .columnDef

                                .header,

                              header.getContext(),

                            )}



                            {header

                              .column

                              .getIsSorted() ===

                              "asc" &&

                              " ↑"}



                            {header

                              .column

                              .getIsSorted() ===

                              "desc" &&

                              " ↓"}

                          </div>



                          <div

                            onMouseDown={header.getResizeHandler()}

                            onTouchStart={header.getResizeHandler()}

                            className={`absolute right-0 top-0 h-full w-1 cursor-col-resize ${header.column.getIsResizing()

                                ? "bg-blue-500"

                                : "hover:bg-gray-500"

                              }`}

                          />

                        </th>

                      ),

                    )}

                  </tr>

                ),

              )}

          </thead>



          {/* BODY */}



          <tbody

            style={{

              position: "relative",

              height: `${rowVirtualizer.getTotalSize()}px`,

            }}

          >

            {virtualRows.map(

              (virtualRow) => {

                const row =

                  rows[

                  virtualRow.index

                  ];



                if (!row) {

                  return null;

                }



                const isSelected =

                  selectedSymbol ===

                  row.original.symbol;



                return (

                  <tr

                    key={row.id}

                    onClick={() =>

                      setSelectedSymbol(

                        row.original.symbol,

                      )

                    }

                    className={`

                      absolute

                      left-0

                      top-0

                      w-full

                      cursor-pointer

                      border-b

                      border-gray-800

                      transition-colors

                      hover:bg-blue-950

                      ${isSelected

                        ? "bg-blue-900"

                        : "even:bg-gray-900/60"

                      }

                    `}

                    style={{

                      height: "36px",

                      transform: `translateY(${virtualRow.start}px)`,

                    }}

                  >

                    {row

                      .getVisibleCells()

                      .map((cell) => (

                        <td

                          key={cell.id}

                          className="

                            whitespace-nowrap

                            px-4

                            py-2

                            text-gray-300

                          "

                          style={{

                            ...getCommonPinningStyles(

                              cell.column,

                            ),

                            width:

                              cell.column.getSize(),

                          }}

                        >

                          {renderCellValue(

                            cell,

                          )}

                        </td>

                      ))}

                  </tr>

                );

              },

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}