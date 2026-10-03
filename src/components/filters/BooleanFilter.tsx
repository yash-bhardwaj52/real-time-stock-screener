"use client";

interface BooleanFilterProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function BooleanFilter({
  label,
  checked,
  onChange,
}: BooleanFilterProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 transition hover:border-gray-700">
      <span className="text-sm font-medium text-gray-300">
        {label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked
            ? "bg-blue-600"
            : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}