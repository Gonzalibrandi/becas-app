import prisma from "@/lib/db/prisma";
import { GraduationCap, X, Search, Sparkles, TrendingUp } from "lucide-react";
import ScholarshipFilters from "./_components/ScholarshipFilters";
import ScholarshipCard from "./_components/ScholarshipCard";
import { Button, Card, Badge, SectionHeader, Title, Subtitle } from "@/components/ui";
import { getFundingInfo, getEducationInfo } from "@/lib/utils/constants";

// Force dynamic rendering - page fetches from database
export const dynamic = 'force-dynamic';

type FilterParams = {
  search?: string;
  country?: string;
  funding?: string;
  level?: string;
  category?: string; // (uses slug)
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

// Get categories from database
async function getCategories(): Promise<{ name: string; slug: string }[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { name: true, slug: true }
    });
    return categories;
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
          { categories: { some: { name: { contains: filters.search } } } },
        ],
      });
    }

    if (filters.country) conditions.push({ country: filters.country });
    if (filters.funding) conditions.push({ fundingType: filters.funding });
    if (filters.level) conditions.push({ educationLevel: filters.level });
    // Filter by category slug using relation
    if (filters.category) conditions.push({ categories: { some: { slug: filters.category } } });

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
        categories: { select: { name: true, slug: true } },
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
  const categories = await getCategories();
  
  const hasFilters = params.search || params.country || params.funding || params.level || params.category;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section - only show when no filters */}
      {!hasFilters && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 sm:p-12">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm mb-4">
              <Sparkles size={16} />
              <span>{scholarships.length} becas disponibles</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Encontrá tu beca ideal
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
              Explorá oportunidades de estudio en todo el mundo. Financiamiento para pregrado, posgrado y doctorado.
            </p>

            {/* Search Bar */}
            <form className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="search"
                  placeholder="Buscar por país, área de estudio o título..."
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-white/30 focus:outline-none text-lg"
                />
              </div>
            </form>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                <span>+50 países</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap size={16} />
                <span>Todos los niveles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {hasFilters ? "Resultados" : "Todas las becas"}
          </h2>
          <p className="text-gray-500">
            {scholarships.length} beca{scholarships.length !== 1 ? "s" : ""} encontrada{scholarships.length !== 1 ? "s" : ""}
            {params.search ? ` para "${params.search}"` : ""}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ScholarshipFilters countries={countries} categories={categories} />
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
          {params.category && (
            <Badge color="blue" icon="🎓">
              {categories.find(c => c.slug === params.category)?.name || params.category}
            </Badge>
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
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <GraduationCap size={40} className="text-emerald-500" />
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