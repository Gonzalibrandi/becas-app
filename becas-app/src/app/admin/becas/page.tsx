import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, ExternalLink, GraduationCap } from "lucide-react";

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
    { value: "REVIEW", label: "Revisión" },
    { value: "PUBLISHED", label: "Publicadas" },
    { value: "ARCHIVED", label: "Archivadas" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Becas</h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">Gestiona todas las becas del sistema</p>
          </div>
          <Link
            href="/admin/becas/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          >
            <Plus size={18} />
            <span>Nueva Beca</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            {/* Search */}
            <form className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="search"
                  defaultValue={params.search}
                  placeholder="Buscar becas..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </form>

            {/* Status Filter - Scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
              {statusFilters.map((filter) => (
                <Link
                  key={filter.value}
                  href={`/admin/becas?status=${filter.value}${params.search ? `&search=${params.search}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-3">
          {scholarships.map((s) => (
            <Link
              key={s.id}
              href={`/admin/becas/${s.id}`}
              className="block bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{s.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">📍 {s.country}</p>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span>{s.educationLevel}</span>
                <span>•</span>
                <span>{s.deadline ? new Date(s.deadline).toLocaleDateString("es-AR") : "Sin fecha"}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">País</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nivel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 truncate max-w-xs">{s.title}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{s.country}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{s.educationLevel}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">
                      {s.deadline ? new Date(s.deadline).toLocaleDateString("es-AR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3">
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

        {/* Empty state for mobile */}
        {scholarships.length === 0 && (
          <div className="lg:hidden p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No se encontraron becas
          </div>
        )}

        <p className="text-xs sm:text-sm text-slate-500 text-center">
          Mostrando {scholarships.length} becas
        </p>
      </div>
    </AdminLayout>
  );
}
