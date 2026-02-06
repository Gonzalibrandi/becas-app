import AdminLayout from "@/features/admin/AdminLayout";
import prisma from "@/lib/prisma";
import AdminBecasClient from "./AdminBecasClient";

export const dynamic = 'force-dynamic';

async function getScholarships(searchParams: { status?: string; search?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  
  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status;
  }
  
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search } },
      { country: { contains: searchParams.search } },
    ];
  }
  
  const scholarships = await prisma.scholarship.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      country: true,
      deadline: true,
      educationLevel: true,
      createdAt: true,
    },
  });

  // Serialize dates to strings for client component
  return scholarships.map(s => ({
    ...s,
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
