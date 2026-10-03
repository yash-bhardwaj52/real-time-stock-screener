"use client";

interface SingleSelectFilterProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function SingleSelectFilter({
  label,
  options,
  value,
  onChange,
}: SingleSelectFilterProps) {
  return (
    <div className="w-full">
      <label className="mb-3 block text-sm font-medium text-white">
        {label}
      </label>

      <div className="space-y-2">
        {options.map((option) => {
          const id = `${label}-${option}`;

          return (
            <label
              key={option}
              htmlFor={id}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-800 bg-gray-900 px-3 py-2.5 text-sm text-gray-300 transition hover:border-gray-700 hover:bg-gray-800"
            >
              <input
                id={id}
                type="radio"
                name={label}
                value={option}
                checked={value === option}
                onChange={() =>
                  onChange(option)
                }
                className="h-4 w-4 border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
              />

              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}