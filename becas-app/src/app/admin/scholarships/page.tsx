import AdminLayout from "../_components/AdminLayout";
import prisma from "@/lib/db/prisma";
import AdminBecasClient from "../_components/AdminBecasClient";

export const dynamic = 'force-dynamic';

async function getScholarships(searchParams: { status?: string; search?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  
  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status;
  }
  
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { countries: { some: { name: { contains: searchParams.search, mode: 'insensitive' } } } },
    ];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scholarships = await (prisma.scholarship as any).findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      countries: {
        select: { name: true }
      },
      deadline: true,
      educationLevel: true,
      createdAt: true,
    },
  });

  // Serialize dates and map country
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return scholarships.map((s: any) => ({
    ...s,
    country: s.countries?.[0]?.name || 'Internacional',
    deadline: s.deadline?.toISOString() ?? null,
  }));
}

export default async function AdminBecasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const scholarships = await getScholarships(params);
  const currentStatus = params.status || "all";

  return (
    <AdminLayout>
      <AdminBecasClient 
        scholarships={scholarships}
        currentStatus={currentStatus}
        searchQuery={params.search || ""}
      />
    </AdminLayout>
  );
}
