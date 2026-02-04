import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, ExternalLink } from "lucide-react";

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
  
  return prisma.scholarship.findMany({
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
}

export default async function AdminBecasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const scholarships = await getScholarships(params);
  const currentStatus = params.status || "all";

  const statusFilters = [
    { value: "all", label: "Todas" },
    { value: "DRAFT", label: "Borrador" },
    { value: "REVIEW", label: "En Revisión" },
    { value: "PUBLISHED", label: "Publicadas" },
    { value: "ARCHIVED", label: "Archivadas" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Becas</h1>
            <p className="text-slate-600 mt-1">Gestiona todas las becas del sistema</p>
          </div>
          <Link
            href="/admin/becas/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            <span>Nueva Beca</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <form className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="search"
                  defaultValue={params.search}
                  placeholder="Buscar becas..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex gap-2">
              {statusFilters.map((filter) => (
                <Link
                  key={filter.value}
                  href={`/admin/becas?status=${filter.value}${params.search ? `&search=${params.search}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentStatus === filter.value
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">País</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nivel</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 truncate max-w-xs">{s.title}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.country}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{s.educationLevel}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {s.deadline ? new Date(s.deadline).toLocaleDateString("es-AR") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/becas/${s.id}`}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/becas/${s.slug}`}
                          target="_blank"
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {scholarships.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No se encontraron becas
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 text-center">
          Mostrando {scholarships.length} becas
        </p>
      </div>
    </AdminLayout>
  );
}
