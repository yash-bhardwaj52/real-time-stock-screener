"use client";

import { useEffect, useState } from "react";

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  step?: number;
  onChange: (value: [number, number]) => void;
}

export default function RangeFilter({
  label,
  min,
  max,
  value,
  step = 1,
  onChange,
}: RangeFilterProps) {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
  }, [value]);

  const updateMin = (newMin: number) => {
    const safeMin = Math.min(
      Math.max(newMin, min),
      localMax,
    );

    setLocalMin(safeMin);
    onChange([safeMin, localMax]);
  };

  const updateMax = (newMax: number) => {
    const safeMax = Math.max(
      Math.min(newMax, max),
      localMin,
    );

    setLocalMax(safeMax);
    onChange([localMin, safeMax]);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">
          {label}
        </label>

        <span className="text-xs text-gray-400">
          {localMin} - {localMax}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={localMin}
          min={min}
          max={localMax}
          step={step}
          onChange={(event) =>
            updateMin(Number(event.target.value))
          }
          className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          placeholder="Min"
        />

        <input
          type="number"
          value={localMax}
          min={localMin}
          max={max}
          step={step}
          onChange={(event) =>
            updateMax(Number(event.target.value))
          }
          className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          placeholder="Max"
        />
      </div>
      <div className="relative h-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          aria-label="Minimum value"
          onChange={(event) =>
            updateMin(Number(event.target.value))
          }
          className="absolute left-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          aria-label="Maximum value"
          onChange={(event) =>
            updateMax(Number(event.target.value))
          }
          className="absolute left-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
      </div>
    </div>
  );
} 
