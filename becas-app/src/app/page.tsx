import Link from "next/link";
import prisma from "@/lib/prisma";
import { Calendar, MapPin, GraduationCap, ArrowRight } from "lucide-react";
import ScholarshipFilters from "@/components/ScholarshipFilters";

type FilterParams = {
  search?: string;
  country?: string;
  funding?: string;
  level?: string;
};

// Get unique countries for filter dropdown
async function getCountries() {
  try {
    const scholarships = await prisma.scholarship.findMany({
      where: { status: "PUBLISHED" },
      select: { country: true },
      distinct: ["country"],
    });
    return scholarships
      .map(s => s.country)
      .filter(Boolean)
      .sort();
  } catch {
    return [];
  }
}

// Fetch scholarships with filters
async function getScholarships(filters: FilterParams) {
  try {
    const conditions: object[] = [{ status: "PUBLISHED" }];

    // Text search
    if (filters.search) {
      conditions.push({
        OR: [
          { title: { contains: filters.search } },
          { country: { contains: filters.search } },
          { areas: { contains: filters.search } },
        ],
      });
    }

    // Country filter
    if (filters.country) {
      conditions.push({ country: filters.country });
    }

    // Funding type filter
    if (filters.funding) {
      conditions.push({ fundingType: filters.funding });
    }

    // Education level filter
    if (filters.level) {
      conditions.push({ educationLevel: filters.level });
    }

    return await prisma.scholarship.findMany({
      where: { AND: conditions },
      select: {
        id: true,
        title: true,
        slug: true,
        country: true,
        deadline: true,
        fundingType: true,
        educationLevel: true,
        description: true,
      },
      orderBy: { deadline: "asc" },
    });
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return [];
  }
}

// Funding type badges
function getFundingBadge(type: string) {
  const badges: Record<string, { label: string; style: string }> = {
    FULL: { label: "Cobertura Total", style: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    PARTIAL: { label: "Parcial", style: "bg-amber-100 text-amber-700 border-amber-200" },
    ONE_TIME: { label: "Pago Único", style: "bg-blue-100 text-blue-700 border-blue-200" },
    UNKNOWN: { label: "Ver detalles", style: "bg-gray-100 text-gray-600 border-gray-200" },
  };
  return badges[type] || badges.UNKNOWN;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<FilterParams>;
}) {
  const params = await searchParams;
  const scholarships = await getScholarships(params);
  const countries = await getCountries();
  
  const hasFilters = params.search || params.country || params.funding || params.level;

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {hasFilters ? "Resultados" : "Becas Disponibles"}
          </h1>
          <p className="text-gray-500 mt-1">
            {scholarships.length} beca{scholarships.length !== 1 ? "s" : ""} encontrada{scholarships.length !== 1 ? "s" : ""}
            {params.search && (
              <span> para "<span className="font-semibold text-gray-700">{params.search}</span>"</span>
            )}
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <ScholarshipFilters countries={countries} />
          
          {hasFilters && (
            <Link 
              href="/"
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
            >
              Limpiar filtros
            </Link>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {params.country && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              📍 {params.country}
            </span>
          )}
          {params.funding && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
              💰 {params.funding === "FULL" ? "Cobertura Total" : params.funding === "PARTIAL" ? "Parcial" : "Pago Único"}
            </span>
          )}
          {params.level && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
              🎓 {
                params.level === "UNDERGRADUATE" ? "Grado" :
                params.level === "MASTER" ? "Maestría" :
                params.level === "PHD" ? "Doctorado" :
                params.level === "RESEARCH" ? "Investigación" : "Curso Corto"
              }
            </span>
          )}
        </div>
      )}

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {scholarships.map((beca) => {
          const funding = getFundingBadge(beca.fundingType);
          
          return (
            <Link 
              href={`/becas/${beca.slug}`} 
              key={beca.id} 
              className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Card Top */}
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
              
              {/* Card Content */}
              <div className="p-5 sm:p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${funding.style}`}>
                    {funding.label}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors mb-3">
                  {beca.title}
                </h2>
                
                {/* Description preview */}
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {beca.description || "Ver más detalles sobre esta beca..."}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" />
                    {beca.country || "Internacional"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    {beca.deadline 
                      ? new Date(beca.deadline).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                      : 'Sin fecha'
                    }
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
                    Ver detalles
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {scholarships.length === 0 && (
        <div className="text-center py-16 sm:py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <GraduationCap size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {hasFilters 
              ? "No encontramos becas con estos filtros"
              : "No hay becas publicadas aún"
            }
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {hasFilters 
              ? "Intenta con otros filtros o limpia la búsqueda."
              : "Las becas aparecerán aquí cuando estén disponibles."
            }
          </p>
          {hasFilters && (
            <Link 
              href="/"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
            >
              Ver todas las becas
            </Link>
          )}
        </div>
      )}
    </div>
  );
}