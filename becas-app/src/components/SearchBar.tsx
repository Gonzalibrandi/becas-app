"use client";

import { Suspense, useState } from "react";
import { Search, X } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

// Inner component that uses useSearchParams
function SearchBarContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Local state for immediate feedback and clear button
  const [term, setTerm] = useState(searchParams.get('search')?.toString() || "");

  const handleSearch = (value: string) => {
    setTerm(value);
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative group w-full max-w-lg mx-auto">
      {/* Decorative glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500 will-change-[opacity]" />
      
      <div className="relative flex items-center w-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 rounded-full transition-all duration-300 px-5 py-3">
        <Search className="text-gray-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5 mr-3 flex-shrink-0" />
        <input
          className="bg-transparent border-none outline-none w-full text-base text-gray-900 placeholder-gray-600"
          placeholder="Buscar becas, países, áreas..."
          value={term}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {term && (
          <button 
            onClick={() => handleSearch("")}
            className="ml-2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            aria-label="Borrar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function SearchBarFallback() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative flex items-center w-full bg-gray-100 border border-transparent rounded-full px-5 py-3">
        <Search className="text-gray-400 w-5 h-5 mr-3" />
        <input
          className="bg-transparent border-none outline-none w-full text-base text-gray-500 placeholder-gray-400"
          placeholder="Cargando buscador..."
          disabled
        />
      </div>
    </div>
  );
}

// Main component wrapped in Suspense
export default function SearchBar() {
  return (
    <Suspense fallback={<SearchBarFallback />}>
      <SearchBarContent />
    </Suspense>
  );
}