"use client";

import { cn } from "@/lib/utils";

const filters = ["Tous", "CDI", "CDD", "Stage", "Alternance", "Télétravail"];

type Props = {
  active: string;
  onChange: (filter: string) => void;
};

export default function FilterBar({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={cn(
            "text-sm px-5 py-2 rounded-full border transition-colors",
            active === filter
              ? "border-indigo-600 text-indigo-600 font-semibold bg-white"
              : "border-gray-200 text-gray-500 bg-white hover:border-indigo-300 hover:text-indigo-500",
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
