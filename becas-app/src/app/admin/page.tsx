import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import prisma from "@/lib/prisma";
import { GraduationCap, Clock, CheckCircle, Archive, FileEdit, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    const [draft, review, published, archived, total] = await Promise.all([
      prisma.scholarship.count({ where: { status: "DRAFT" } }),
      prisma.scholarship.count({ where: { status: "REVIEW" } }),
      prisma.scholarship.count({ where: { status: "PUBLISHED" } }),
      prisma.scholarship.count({ where: { status: "ARCHIVED" } }),
      prisma.scholarship.count(),
    ]);
    return { draft, review, published, archived, total };
  } catch (error) {
    console.error("Error getting stats:", error);
    return { draft: 0, review: 0, published: 0, archived: 0, total: 0 };
  }
}

async function getRecentScholarships() {
  try {
    return await prisma.scholarship.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        country: true,
      },
    });
  } catch (error) {
    console.error("Error getting scholarships:", error);
    return [];
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recent = await getRecentScholarships();

  const statCards = [
    { 
      label: "Borradores", 
      value: stats.draft, 
      icon: FileEdit, 
      gradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600"
    },
    { 
      label: "En Revisión", 
      value: stats.review, 
      icon: Clock, 
      gradient: "from-blue-500 to-indigo-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      label: "Publicadas", 
      value: stats.published, 
      icon: CheckCircle, 
      gradient: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    { 
      label: "Archivadas", 
      value: stats.archived, 
      icon: Archive, 
      gradient: "from-slate-500 to-gray-500",
      bgLight: "bg-slate-50",
      textColor: "text-slate-600"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Resumen del sistema de becas</p>
          </div>
          <Link
            href="/admin/becas"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
          >
            <span>Ver Becas</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div 
              key={card.label} 
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bgLight} flex items-center justify-center`}>
                  <card.icon className={card.textColor} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Card */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl shadow-xl p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white rounded-full" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-white rounded-full" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                <TrendingUp size={14} />
                Total de Becas
              </p>
              <p className="text-3xl font-bold mt-0.5">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Recent Scholarships */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Becas Recientes</h2>
            <Link 
              href="/admin/becas"
              className="text-emerald-600 hover:text-emerald-700 font-medium text-xs flex items-center gap-1 transition-colors"
            >
              Ver todas
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map((scholarship) => (
              <Link 
                key={scholarship.id}
                href={`/admin/becas/${scholarship.id}`}
                className="block p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <GraduationCap size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{scholarship.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">📍 {scholarship.country}</p>
                    </div>
                  </div>
                  <StatusBadge status={scholarship.status} />
                </div>
              </Link>
            ))}
            {recent.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <GraduationCap size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No hay becas todavía</p>
                <p className="text-gray-400 text-sm mt-1">Ejecuta el scraper para agregar becas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
