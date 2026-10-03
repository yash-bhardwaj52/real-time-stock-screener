"use client";

import { useState } from "react";

import {
  getPresetById,
  screenerPresets,
} from "@/lib/presets";

import { useStockStore } from "@/store/stockstore";

interface PresetSelectorProps {
  onPresetApplied?: (
    presetName: string,
  ) => void;
}

export default function PresetSelector({
  onPresetApplied,
}: PresetSelectorProps) {
  const [selectedPreset, setSelectedPreset] =
    useState("");

  const addFilter =
    useStockStore(
      (state) => state.addFilter,
    );

  const addComparison =
    useStockStore(
      (state) => state.addComparison,
    );

  const clearAllFilters =
    useStockStore(
      (state) =>
        state.clearAllFilters,
    );

  const clearAllComparisons =
    useStockStore(
      (state) =>
        state.clearAllComparisons,
    );

  const handleApplyPreset = (
    presetId: string,
  ) => {
    const preset =
      getPresetById(presetId);

    if (!preset) {
      return;
    }

    /*
     * Remove existing filters
     * and comparisons first.
     */
    clearAllFilters();
    clearAllComparisons();

    /*
     * Apply normal filters.
     */
    preset.filters.forEach(
      (filter) => {
        addFilter(filter);
      },
    );

    /*
     * Apply field-to-field
     * comparisons.
     *
     * Example:
     * lastPrice > sma50
     */
    preset.comparisons?.forEach(
      (comparison) => {
        addComparison(
          comparison,
        );
      },
    );

    setSelectedPreset(
      presetId,
    );

    onPresetApplied?.(
      preset.name,
    );
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div>
        <h3 className="text-sm font-semibold text-white">
          Screener Presets
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Apply a predefined screening strategy.
        </p>
      </div>

      <div className="space-y-2">
        {screenerPresets.map(
          (preset) => {
            const isSelected =
              selectedPreset ===
              preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    preset.id,
                  )
                }
                className={`w-full rounded-lg border p-3 text-left transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-800 bg-gray-950 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white">
                    {preset.name}
                  </span>

                  {isSelected && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Active
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {preset.description}
                </p>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-600">
                  <span>
                    {preset.filters.length} filters
                  </span>

                  {preset.comparisons &&
                    preset.comparisons.length >
                      0 && (
                      <>
                        <span>•</span>
                        <span>
                          {
                            preset
                              .comparisons
                              .length
                          }{" "}
                          comparisons
                        </span>
                      </>
                    )}
                </div>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}