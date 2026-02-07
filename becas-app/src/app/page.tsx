import prisma from "@/lib/prisma";
import { GraduationCap, X } from "lucide-react";
import ScholarshipFilters from "@/features/scholarships/components/ScholarshipFilters";
import ScholarshipCard from "@/features/scholarships/components/ScholarshipCard";
import { Button, Card, Badge, SectionHeader, Title, Subtitle } from "@/components";
import { getFundingInfo, getEducationInfo } from "@/lib/constants";
import SearchBar from "@/components/SearchBar";

// Force dynamic rendering - page fetches from database
export const dynamic = 'force-dynamic';

type FilterParams = {
  search?: string;
  country?: string;
  funding?: string;
  level?: string;
  area?: string;
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

async function getStudyAreas(): Promise<string[]> {
  try {
    const scholarships = await prisma.scholarship.findMany({
      where: { status: "PUBLISHED" },
      select: { areas: true },
      distinct: ["areas"],
    });
    return scholarships
      .map(s => s.areas)
      .filter((a): a is string => Boolean(a))
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
    if (filters.area) conditions.push({ areas: { contains: filters.area } });

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
        areas: true,
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
  const studyAreas = await getStudyAreas();
  
  const hasFilters = params.search || params.country || params.funding || params.level || params.area;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <SectionHeader
        title={hasFilters ? "Resultados" : "Becas Disponibles"}
        subtitle={`${scholarships.length} beca${scholarships.length !== 1 ? "s" : ""} encontrada${scholarships.length !== 1 ? "s" : ""}${params.search ? ` para "${params.search}"` : ""}`}
      >
        <div className="flex items-center gap-3">
          <ScholarshipFilters countries={countries} areaOptions={studyAreas} />
          {hasFilters && (
            <Button 
              href="/" 
              variant="outline" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-300 hover:bg-red-100 transition-all group"
            >
              <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Limpiar</span>
            </Button>
          )}
        </div>
      </SectionHeader>

      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {params.country && (
            <Badge color="emerald" icon="📍">{params.country}</Badge>
          )}
          {params.funding && (
            <Badge color="amber" icon={getFundingInfo(params.funding).icon}>
              {getFundingInfo(params.funding).label}
            </Badge>
          )}
          {params.level && (
            <Badge color="purple" icon={getEducationInfo(params.level).icon}>
              {getEducationInfo(params.level).label}
            </Badge>
          )}
          {params.area && (
            <Badge color="blue" icon="📍">{params.area}</Badge>
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
        <Card variant="bordered" padding="lg" className="text-center border-dashed">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <GraduationCap size={40} className="text-gray-400" />
          </div>
          <Title size="md" className="mb-2">
            {hasFilters 
              ? "No encontramos becas con estos filtros"
              : "No hay becas publicadas aún"
            }
          </Title>
          <Subtitle className="max-w-md mx-auto">
            {hasFilters 
              ? "Intenta con otros filtros o limpia la búsqueda."
              : "Las becas aparecerán aquí cuando estén disponibles."
            }
          </Subtitle>
          {hasFilters && (
            <Button href="/" variant="primary" size="lg" className="mt-6">
              Ver todas las becas
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}