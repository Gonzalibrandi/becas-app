import Link from "next/link";
import prisma from "@/lib/prisma";
import { GraduationCap } from "lucide-react";
import ScholarshipFilters from "@/components/ScholarshipFilters";
import ScholarshipCard from "@/components/ScholarshipCard";
import { getFundingInfo, getEducationInfo } from "@/lib/constants";

// Force dynamic rendering - page fetches from database
export const dynamic = 'force-dynamic';

type FilterParams = {
  search?: string;
  country?: string;
  funding?: string;
  level?: string;
};

// Get unique countries for filter dropdown
async function getCountries(): Promise<string[]> {
  try {
    const scholarships = await prisma.scholarship.findMany({
      where: { status: "PUBLISHED" },
      select: { country: true },
      distinct: ["country"],
    });
    return scholarships
      .map(s => s.country)
      .filter((c): c is string => Boolean(c))
      .sort();
  } catch {
    return [];
  }
}

// Fetch scholarships with filters
async function getScholarships(filters: FilterParams) {
  try {
    const conditions: object[] = [{ status: "PUBLISHED" }];

    if (filters.search) {
      conditions.push({
        OR: [
          { title: { contains: filters.search } },
          { country: { contains: filters.search } },
          { areas: { contains: filters.search } },
        ],
      });
    }

    if (filters.country) conditions.push({ country: filters.country });
    if (filters.funding) conditions.push({ fundingType: filters.funding });
    if (filters.level) conditions.push({ educationLevel: filters.level });

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
              {getFundingInfo(params.funding).icon} {getFundingInfo(params.funding).label}
            </span>
          )}
          {params.level && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
              {getEducationInfo(params.level).icon} {getEducationInfo(params.level).label}
            </span>
          )}
        </div>
      )}

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {scholarships.map((beca) => (
          <ScholarshipCard key={beca.id} scholarship={beca} />
        ))}
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