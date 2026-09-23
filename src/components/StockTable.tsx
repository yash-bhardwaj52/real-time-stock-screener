"use client";

import { useState } from "react";
import { useStockStore } from "@/store/stockstore";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";

import type { Stock } from "@/types/stock";

interface StockTableProps {
  data: Stock[];
}

export default function StockTable({ data }: StockTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const selectedSymbol = useStockStore((state) => state.selectedSymbol);
const setSelectedSymbol = useStockStore(
  (state) => state.setSelectedSymbol
);

  const columns: ColumnDef<Stock>[] = [
    { accessorKey: "symbol", header: "Symbol" },
    { accessorKey: "companyName", header: "Company" },
    { accessorKey: "sector", header: "Sector" },
    { accessorKey: "industry", header: "Industry" },
    { accessorKey: "marketCapCategory", header: "Market Cap Category" },
    { accessorKey: "indexMembership", header: "Index" },

    { accessorKey: "lastPrice", header: "Price" },
    { accessorKey: "previousClose", header: "Previous Close" },
    { accessorKey: "dayOpen", header: "Day Open" },
    { accessorKey: "dayHigh", header: "Day High" },
    { accessorKey: "dayLow", header: "Day Low" },
    { accessorKey: "changePercent", header: "Change %" },
    { accessorKey: "changeAbsolute", header: "Change" },

    { accessorKey: "volume", header: "Volume" },
    { accessorKey: "avgVolume20D", header: "Avg Volume 20D" },

    { accessorKey: "week52High", header: "52W High" },
    { accessorKey: "week52Low", header: "52W Low" },

    { accessorKey: "marketCap", header: "Market Cap" },
    { accessorKey: "pe", header: "P/E" },
    { accessorKey: "pb", header: "P/B" },
    { accessorKey: "dividendYield", header: "Dividend Yield" },
    { accessorKey: "eps", header: "EPS" },

    { accessorKey: "roe", header: "ROE" },
    { accessorKey: "roce", header: "ROCE" },
    { accessorKey: "debtToEquity", header: "Debt / Equity" },
    { accessorKey: "currentRatio", header: "Current Ratio" },
    { accessorKey: "promoterHolding", header: "Promoter Holding" },

    { accessorKey: "revenueGrowthYoY", header: "Revenue Growth YoY" },
    { accessorKey: "profitGrowthYoY", header: "Profit Growth YoY" },

    { accessorKey: "rsi14", header: "RSI 14" },
    { accessorKey: "sma50", header: "SMA 50" },
    { accessorKey: "sma200", header: "SMA 200" },
    { accessorKey: "beta", header: "Beta" },
    { accessorKey: "atr", header: "ATR" },

    { accessorKey: "macdSignal", header: "MACD Signal" },
    { accessorKey: "bollingerPosition", header: "Bollinger Position" },
    { accessorKey: "volumeVsAvg", header: "Volume vs Avg" },
  ];

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
    },

    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    enableColumnResizing: true,
    columnResizeMode: "onChange",
  });

  return (
    <div className="max-h-[600px] w-full overflow-auto rounded-lg border border-gray-700">
      <table
        className="border-collapse text-sm"
        style={{
          width: table.getTotalSize(),
          minWidth: "100%",
        }}
      >
        <thead className="bg-gray-900">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="sticky top-0 z-10 border-b border-gray-700 bg-gray-900 px-4 py-3 text-left font-semibold text-white"
                  style={{
                    width: header.getSize(),
                    position: "relative",
                  }}
                >
                  <div
                    className="cursor-pointer select-none hover:text-blue-400"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {header.column.getIsSorted() === "asc" && " ↑"}
                    {header.column.getIsSorted() === "desc" && " ↓"}
                  </div>

                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`absolute right-0 top-0 h-full w-1 cursor-col-resize ${
                      header.column.getIsResizing()
                        ? "bg-blue-500"
                        : "hover:bg-gray-500"
                    }`}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isSelected = selectedSymbol === row.original.symbol;
            return (
              <tr
                key={row.id}
                onClick={() => setSelectedSymbol(row.original.symbol)}
                className={`
                  cursor-pointer
                  border-b border-gray-800
                  transition-colors
                  hover:bg-blue-950
                  ${isSelected ? "bg-blue-900" : "even:bg-gray-900/60"}
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-4 py-3 text-gray-300"
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {cell.getValue() === null ||
                    cell.getValue() === undefined
                      ? "-"
                      : flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}