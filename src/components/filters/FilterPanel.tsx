"use client";

import { useEffect, useMemo, useState } from "react";

import MultiSelectFilter from "@/components/filters/MultiSelectFilter";
import RangeFilter from "@/components/filters/RangeFilter";
import SingleSelectFilter from "@/components/filters/SingleSelectFilter";
import BooleanFilter from "@/components/filters/BooleanFilter";

import { useStockStore } from "@/store/stockstore";

interface FilterPanelProps {
  sectors: string[];
  industries: string[];
  indices: string[];
  matchingCount: number;
  totalCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface AccordionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: AccordionProps) {
  const [open, setOpen] =
    useState(defaultOpen);

  return (
    <div className="border-b border-gray-800 last:border-b-0">
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex w-full items-center justify-between py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <span>{icon}</span>
          <span>{title}</span>
        </span>

        <span className="text-xs text-gray-500">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

const PE_MIN = 0;
const PE_MAX = 100;

const RECENT_UPDATE_WINDOW_MS = 5000;

const MACD_OPTIONS = [
  "Bullish",
  "Bearish",
  "Neutral",
];

export default function FilterPanel({
  sectors,
  industries,
  indices,
  matchingCount,
  totalCount,
  collapsed,
  onToggleCollapse,
}: FilterPanelProps) {
  const activeFilters = useStockStore(
    (state) => state.activeFilters,
  );

  const addFilter = useStockStore(
    (state) => state.addFilter,
  );

  const removeFilter = useStockStore(
    (state) => state.removeFilter,
  );

  const clearAllFilters = useStockStore(
    (state) => state.clearAllFilters,
  );

  const watchlist = useStockStore(
    (state) => state.watchlist,
  );

  const livePrices = useStockStore(
    (state) => state.livePrices,
  );

  const peFilter = activeFilters.find(
    (filter) => filter.id === "pe-range",
  );

  const sectorFilter = activeFilters.find(
    (filter) =>
      filter.id === "sector-filter",
  );

  const industryFilter = activeFilters.find(
    (filter) =>
      filter.id === "industry-filter",
  );

  const indexFilter = activeFilters.find(
    (filter) =>
      filter.id === "index-filter",
  );

  const macdFilter = activeFilters.find(
    (filter) =>
      filter.id === "macd-filter",
  );

  const watchlistFilter = activeFilters.find(
    (filter) =>
      filter.id === "watchlist-filter",
  );

  const recentlyUpdatedFilter =
    activeFilters.find(
      (filter) =>
        filter.id ===
        "recently-updated-filter",
    );

  const [peRange, setPeRange] = useState<
    [number, number]
  >([PE_MIN, PE_MAX]);

  const [selectedSectors, setSelectedSectors] =
    useState<string[]>([]);

  const [
    selectedIndustries,
    setSelectedIndustries,
  ] = useState<string[]>([]);

  const [
    selectedIndices,
    setSelectedIndices,
  ] = useState<string[]>([]);

  const [selectedMacd, setSelectedMacd] =
    useState("");

  const [watchlistOnly, setWatchlistOnly] =
    useState(false);

  const [
    recentlyUpdatedOnly,
    setRecentlyUpdatedOnly,
  ] = useState(false);

  const [
    filterSearch,
    setFilterSearch,
  ] = useState("");

  const recentlyUpdatedSymbols = useMemo(() => {
    const now = Date.now();

    return Array.from(livePrices.entries())
      .filter(
        ([, priceData]) =>
          now - priceData.updatedAt <=
          RECENT_UPDATE_WINDOW_MS,
      )
      .map(([symbol]) => symbol);
  }, [livePrices]);

  useEffect(() => {
    if (
      peFilter &&
      peFilter.operator === "between" &&
      Array.isArray(peFilter.value) &&
      peFilter.value.length >= 2 &&
      typeof peFilter.value[0] === "number" &&
      typeof peFilter.value[1] === "number"
    ) {
      setPeRange([
        peFilter.value[0],
        peFilter.value[1],
      ]);
    } else {
      setPeRange([
        PE_MIN,
        PE_MAX,
      ]);
    }
  }, [peFilter]);

  useEffect(() => {
    if (
      sectorFilter &&
      sectorFilter.operator === "in" &&
      Array.isArray(sectorFilter.value)
    ) {
      setSelectedSectors(
        sectorFilter.value.filter(
          (value): value is string =>
            typeof value === "string",
        ),
      );
    } else {
      setSelectedSectors([]);
    }
  }, [sectorFilter]);

  useEffect(() => {
    if (
      industryFilter &&
      industryFilter.operator === "in" &&
      Array.isArray(industryFilter.value)
    ) {
      setSelectedIndustries(
        industryFilter.value.filter(
          (value): value is string =>
            typeof value === "string",
        ),
      );
    } else {
      setSelectedIndustries([]);
    }
  }, [industryFilter]);

  useEffect(() => {
    if (
      indexFilter &&
      indexFilter.operator === "in" &&
      Array.isArray(indexFilter.value)
    ) {
      setSelectedIndices(
        indexFilter.value.filter(
          (value): value is string =>
            typeof value === "string",
        ),
      );
    } else {
      setSelectedIndices([]);
    }
  }, [indexFilter]);

  useEffect(() => {
    if (
      macdFilter &&
      macdFilter.operator === "eq" &&
      typeof macdFilter.value === "string"
    ) {
      setSelectedMacd(macdFilter.value);
    } else {
      setSelectedMacd("");
    }
  }, [macdFilter]);

  useEffect(() => {
    setWatchlistOnly(
      Boolean(watchlistFilter),
    );
  }, [watchlistFilter]);

  useEffect(() => {
    setRecentlyUpdatedOnly(
      Boolean(recentlyUpdatedFilter),
    );
  }, [recentlyUpdatedFilter]);

  const handlePeChange = (
    value: [number, number],
  ) => {
    setPeRange(value);

    const [min, max] = value;

    if (
      min === PE_MIN &&
      max === PE_MAX
    ) {
      removeFilter("pe-range");
      return;
    }

    if (peFilter) {
      removeFilter("pe-range");
    }

    addFilter({
      id: "pe-range",
      field: "pe",
      operator: "between",
      value,
      enabled: true,
    });
  };

  const handleSectorChange = (
    value: string[],
  ) => {
    setSelectedSectors(value);

    if (value.length === 0) {
      removeFilter("sector-filter");
      return;
    }

    if (sectorFilter) {
      removeFilter("sector-filter");
    }

    addFilter({
      id: "sector-filter",
      field: "sector",
      operator: "in",
      value,
      enabled: true,
    });
  };

  const handleIndustryChange = (
    value: string[],
  ) => {
    setSelectedIndustries(value);

    if (value.length === 0) {
      removeFilter("industry-filter");
      return;
    }

    if (industryFilter) {
      removeFilter("industry-filter");
    }

    addFilter({
      id: "industry-filter",
      field: "industry",
      operator: "in",
      value,
      enabled: true,
    });
  };

  const handleIndexChange = (
    value: string[],
  ) => {
    setSelectedIndices(value);

    if (value.length === 0) {
      removeFilter("index-filter");
      return;
    }

    if (indexFilter) {
      removeFilter("index-filter");
    }

    addFilter({
      id: "index-filter",
      field: "indexMembership",
      operator: "in",
      value,
      enabled: true,
    });
  };

  const handleMacdChange = (
    value: string,
  ) => {
    setSelectedMacd(value);

    if (!value) {
      removeFilter("macd-filter");
      return;
    }

    if (macdFilter) {
      removeFilter("macd-filter");
    }

    addFilter({
      id: "macd-filter",
      field: "macdSignal",
      operator: "eq",
      value,
      enabled: true,
    });
  };

  const handleWatchlistChange = (
    checked: boolean,
  ) => {
    setWatchlistOnly(checked);

    if (!checked) {
      removeFilter("watchlist-filter");
      return;
    }

    if (watchlistFilter) {
      removeFilter("watchlist-filter");
    }

    addFilter({
      id: "watchlist-filter",
      field: "symbol",
      operator: "in",
      value: Array.from(watchlist),
      enabled: true,
    });
  };

  useEffect(() => {
    if (!watchlistOnly) {
      return;
    }

    const symbols = Array.from(
      watchlist,
    );

    removeFilter("watchlist-filter");

    addFilter({
      id: "watchlist-filter",
      field: "symbol",
      operator: "in",
      value: symbols,
      enabled: true,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist]);

  const handleRecentlyUpdatedChange = (
    checked: boolean,
  ) => {
    setRecentlyUpdatedOnly(checked);

    if (!checked) {
      removeFilter(
        "recently-updated-filter",
      );
      return;
    }

    if (recentlyUpdatedFilter) {
      removeFilter(
        "recently-updated-filter",
      );
    }

    addFilter({
      id: "recently-updated-filter",
      field: "symbol",
      operator: "in",
      value: recentlyUpdatedSymbols,
      enabled: true,
    });
  };

  useEffect(() => {
    if (!recentlyUpdatedOnly) {
      return;
    }

    removeFilter(
      "recently-updated-filter",
    );

    addFilter({
      id: "recently-updated-filter",
      field: "symbol",
      operator: "in",
      value: recentlyUpdatedSymbols,
      enabled: true,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrices]);

  const removeActiveFilter = (
    filterId: string,
  ) => {
    removeFilter(filterId);

    if (filterId === "pe-range") {
      setPeRange([
        PE_MIN,
        PE_MAX,
      ]);
    }

    if (filterId === "sector-filter") {
      setSelectedSectors([]);
    }

    if (filterId === "industry-filter") {
      setSelectedIndustries([]);
    }

    if (filterId === "index-filter") {
      setSelectedIndices([]);
    }

    if (filterId === "macd-filter") {
      setSelectedMacd("");
    }

    if (filterId === "watchlist-filter") {
      setWatchlistOnly(false);
    }

    if (
      filterId ===
      "recently-updated-filter"
    ) {
      setRecentlyUpdatedOnly(false);
    }
  };

  const handleClearAll = () => {
    clearAllFilters();

    setPeRange([
      PE_MIN,
      PE_MAX,
    ]);

    setSelectedSectors([]);
    setSelectedIndustries([]);
    setSelectedIndices([]);
    setSelectedMacd("");
    setWatchlistOnly(false);
    setRecentlyUpdatedOnly(false);
  };

  const search = filterSearch
    .trim()
    .toLowerCase();

  const showFundamentals =
    !search ||
    "fundamentals".includes(search);

  const showMarketData =
    !search ||
    "market data".includes(search);

  const showClassification =
    !search ||
    "classification".includes(search);

  const showTechnical =
    !search ||
    "technical".includes(search);

  const showCustom =
    !search ||
    "custom".includes(search);

  if (collapsed) {
    return (
      <div className="flex min-h-[300px] flex-col items-center rounded-xl border border-gray-800 bg-gray-900 p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand filters"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-lg text-blue-400 transition hover:bg-blue-500/20"
        >
          ☰
        </button>

        <div className="mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
          {activeFilters.length}
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <span className="[writing-mode:vertical-rl]">
            FILTERS
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">
              Filters
            </h2>

            <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">
              {activeFilters.length}
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-300">
              {matchingCount.toLocaleString()}
            </span>{" "}
            of{" "}
            {totalCount.toLocaleString()} stocks
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Collapse filters"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-700 text-sm text-gray-400 transition hover:border-gray-600 hover:text-white"
        >
          ←
        </button>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          type="search"
          value={filterSearch}
          onChange={(event) =>
            setFilterSearch(
              event.target.value,
            )
          }
          placeholder="Search filter categories..."
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          aria-label="Search filter categories"
        />
      </div>

      {/* Active Chips */}
      {activeFilters.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400">
              Active Filters
            </p>

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {peFilter && (
              <button
                type="button"
                onClick={() =>
                  removeActiveFilter(
                    "pe-range",
                  )
                }
                className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
              >
                P/E {peRange[0]}-{peRange[1]} ×
              </button>
            )}

            {sectorFilter && (
              <button
                type="button"
                onClick={() =>
                  removeActiveFilter(
                    "sector-filter",
                  )
                }
                className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
              >
                Sector ({selectedSectors.length}) ×
              </button>
            )}

            {industryFilter && (
              <button
                type="button"
                onClick={() =>
                  removeActiveFilter(
                    "industry-filter",
                  )
                }
                className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
              >
                Industry ({selectedIndustries.length}) ×
              </button>
            )}

            {indexFilter && (
              <button
                type="button"
                onClick={() =>
                  removeActiveFilter(
                    "index-filter",
                  )
                }
                className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
              >
                Index ({selectedIndices.length}) ×
              </button>
            )}

            {macdFilter && (
              <button
                type="button"
                onClick={() =>
                  removeActiveFilter(
                    "macd-filter",
                  )
                }
                className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
              >
                MACD: {selectedMacd} ×
              </button>
            )}

            {watchlistFilter && (
              <button
                type="button"
                onClick={() =>
                  removeActiveFilter(
                    "watchlist-filter",
                  )
                }
                className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
              >
                Watchlist Only ×
              </button>
            )}

            {recentlyUpdatedFilter && (
              <button
                type="button"
                onClick={() =>
                  removeActiveFilter(
                    "recently-updated-filter",
                  )
                }
                className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
              >
                Recently Updated ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Accordions */}
      <div className="mt-4">
        {showFundamentals && (
          <Accordion
            title="Fundamentals"
            icon="📊"
            defaultOpen
          >
            <RangeFilter
              label="P/E Ratio"
              min={PE_MIN}
              max={PE_MAX}
              step={0.1}
              value={peRange}
              onChange={handlePeChange}
            />
          </Accordion>
        )}

        {showMarketData && (
          <Accordion
            title="Market Data"
            icon="📈"
          >
            <p className="text-xs text-gray-500">
              Additional market-data filters will
              be added in the upcoming filter
              expansion.
            </p>
          </Accordion>
        )}

        {showClassification && (
          <Accordion
            title="Classification"
            icon="🏷️"
            defaultOpen
          >
            <MultiSelectFilter
              label="Sector"
              options={sectors}
              value={selectedSectors}
              onChange={handleSectorChange}
            />

            <MultiSelectFilter
              label="Industry"
              options={industries}
              value={selectedIndustries}
              onChange={handleIndustryChange}
            />

            <MultiSelectFilter
              label="Index"
              options={indices}
              value={selectedIndices}
              onChange={handleIndexChange}
            />
          </Accordion>
        )}

        {showTechnical && (
          <Accordion
            title="Technical"
            icon="📉"
            defaultOpen
          >
            <SingleSelectFilter
              label="MACD Signal"
              options={MACD_OPTIONS}
              value={selectedMacd}
              onChange={handleMacdChange}
            />
          </Accordion>
        )}

        {showCustom && (
          <Accordion
            title="Custom"
            icon="⚙️"
            defaultOpen
          >
            <div className="space-y-2">
              <BooleanFilter
                label="Watchlist Only"
                checked={watchlistOnly}
                onChange={
                  handleWatchlistChange
                }
              />

              <BooleanFilter
                label="Recently Updated"
                checked={
                  recentlyUpdatedOnly
                }
                onChange={
                  handleRecentlyUpdatedChange
                }
              />
            </div>
          </Accordion>
        )}
      </div>

      {/* Bottom clear */}
      {activeFilters.length > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="mt-4 w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}