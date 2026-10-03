"use client";

import { useEffect, useRef, useState } from "react";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export default function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const filteredOptions = options.filter(
    (option) =>
      option
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const toggleOption = (
    option: string,
  ) => {
    if (value.includes(option)) {
      onChange(
        value.filter(
          (item) => item !== option,
        ),
      );
    } else {
      onChange([
        ...value,
        option,
      ]);
    }
  };

  const selectAll = () => {
    onChange(options);
  };

  const clearSelection = () => {
    onChange([]);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <label className="mb-2 block text-sm font-medium text-white">
        {label}
      </label>

      {/* Dropdown button */}
      <button
        type="button"
        onClick={() =>
          setIsOpen((open) => !open)
        }
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-left text-sm text-white outline-none transition hover:border-gray-600 focus:border-blue-500"
      >
        <span className="truncate">
          {value.length === 0
            ? `Select ${label}`
            : `${value.length} selected`}
        </span>

        <span className="ml-2 text-gray-400">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
          {/* Search */}
          <div className="border-b border-gray-800 p-3">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              Select All
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="text-xs font-medium text-gray-400 hover:text-gray-300"
            >
              Clear
            </button>
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-gray-500">
                No results found
              </p>
            ) : (
              filteredOptions.map(
                (option) => {
                  const checked =
                    value.includes(
                      option,
                    );

                  return (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleOption(
                            option,
                          )
                        }
                        className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
                      />

                      <span>
                        {option}
                      </span>
                    </label>
                  );
                },
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}