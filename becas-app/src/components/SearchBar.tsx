"use client";

import { Suspense } from "react";
import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

// Inner component that uses useSearchParams
function SearchBarContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative flex items-center w-full max-w-md bg-gray-100 rounded-full px-4 py-2 mx-auto">
      <Search className="text-gray-400 w-5 h-5 mr-3" />
      <input
        className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-500"
        placeholder="Buscar becas, países..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('search')?.toString()}
      />
    </div>
  );
}

// Loading fallback for Suspense
function SearchBarFallback() {
  return (
    <div className="relative flex items-center w-full max-w-md bg-gray-100 rounded-full px-4 py-2 mx-auto">
      <Search className="text-gray-400 w-5 h-5 mr-3" />
      <input
        className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-500"
        placeholder="Buscar becas, países..."
        disabled
      />
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