"use client";

import { Search, MapPin } from "lucide-react";

type Props = {
  query?: string;
  location?: string;
  onQueryChange?: (v: string) => void;
  onLocationChange?: (v: string) => void;
};

export default function SearchBar({ query = "", location = "", onQueryChange, onLocationChange }: Props) {
  return (
    <div className="flex items-center max-w-3xl border border-brand-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 flex-1">
        <Search className="w-4 h-4 text-indigo-600 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder="Saisir un metier ou un mot cle"
          className="w-full py-3 text-sm text-indigo-600 placeholder-brand-300 outline-none bg-transparent"
        />
      </div>

      <div className="w-px h-6 bg-brand-100" />

      <div className="flex items-center gap-2 px-4 flex-1">
        <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange?.(e.target.value)}
          placeholder="Ville, departement ..."
          className="w-full py-3 text-sm text-indigo-600 placeholder-brand-300 outline-none bg-transparent"
        />
      </div>

      <button type="button" className="bg-indigo-500 hover:bg-indigo-600 transition-colors text-white text-sm font-semibold px-7 py-3 cursor-pointer">
        Rechercher
      </button>
    </div>
  );
}
