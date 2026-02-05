"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { FUNDING_TYPES, EDUCATION_LEVELS, STUDY_AREAS } from "@/lib/constants";

// Inner component that uses useSearchParams
function FiltersContent({ countries }: { countries: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    country: searchParams.get("country") || "",
    funding: searchParams.get("funding") || "",
    level: searchParams.get("level") || "",
    area: searchParams.get("area") || "",
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    
    if (filters.country) params.set("country", filters.country);
    if (filters.funding) params.set("funding", filters.funding);
    if (filters.level) params.set("level", filters.level);
    if (filters.area) params.set("area", filters.area);
    
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({ country: "", funding: "", level: "", area: "" });
    const search = searchParams.get("search");
    router.push(search ? `/?search=${search}` : "/");
    setIsOpen(false);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  // Only show first 3 funding types (exclude UNKNOWN)
  const fundingOptions = FUNDING_TYPES.slice(0, 3);
  // Only show first 5 education levels (exclude OTHER)
  const levelOptions = EDUCATION_LEVELS.slice(0, 5);
  // Only show first 9 areas (exclude ALL)
  const areaOptions = STUDY_AREAS.slice(0, 9);

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
          ${activeFiltersCount > 0 
            ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-200" 
            : "bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300"
          }
        `}
      >
        <Filter size={18} />
        <span className="hidden sm:inline">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown Panel */}
          <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Filtrar Becas</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Options */}
            <div className="p-4 space-y-4">
              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  País de destino
                </label>
                <select
                  value={filters.country}
                  onChange={(e) => updateFilter("country", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                >
                  <option value="">Todos los países</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Study Area - NEW */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Área de estudio
                </label>
                <select
                  value={filters.area}
                  onChange={(e) => updateFilter("area", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                >
                  <option value="">Todas las áreas</option>
                  {areaOptions.map((area) => (
                    <option key={area.value} value={area.value}>{area.icon} {area.label}</option>
                  ))}
                </select>
              </div>

              {/* Funding Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de financiamiento
                </label>
                <select
                  value={filters.funding}
                  onChange={(e) => updateFilter("funding", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                >
                  <option value="">Todos los tipos</option>
                  {fundingOptions.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nivel educativo
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => updateFilter("level", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                >
                  <option value="">Todos los niveles</option>
                  {levelOptions.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Fallback for Suspense
function FiltersFallback() {
  return (
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-white text-gray-600 border-2 border-gray-200">
      <Filter size={18} />
      <span className="hidden sm:inline">Filtros</span>
      <ChevronDown size={16} />
    </button>
  );
}

// Main component wrapped in Suspense
export default function ScholarshipFilters({ countries }: { countries: string[] }) {
  return (
    <Suspense fallback={<FiltersFallback />}>
      <FiltersContent countries={countries} />
    </Suspense>
  );
}
