import prisma from "@/lib/db/prisma";

export type FilterParams = {
  search?: string;
  country?: string;
  funding?: string;
  level?: string;
};

// Get unique countries for filter dropdown
export async function getCountries(): Promise<string[]> {
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
export async function getScholarships(filters: FilterParams) {
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
