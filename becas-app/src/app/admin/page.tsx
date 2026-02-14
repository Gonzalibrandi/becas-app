import AdminLayout from "./_components/AdminLayout";
import StatusBadge from "./_components/StatusBadge";
import prisma from "@/lib/db/prisma";
import { 
  GraduationCap, Clock, CheckCircle, Archive, FileEdit, TrendingUp, ArrowRight, 
  Users, UserPlus, Sparkles 
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getStats() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    const [
      draft, review, published, archived, totalScholarships,
      totalUsers, newScholarships7d, newUsers30d
    ] = await Promise.all([
      prisma.scholarship.count({ where: { status: "DRAFT" } }),
      prisma.scholarship.count({ where: { status: "REVIEW" } }),
      prisma.scholarship.count({ where: { status: "PUBLISHED" } }),
      prisma.scholarship.count({ where: { status: "ARCHIVED" } }),
      prisma.scholarship.count(),
      prisma.user.count(),
      prisma.scholarship.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);
    return { 
      draft, review, published, archived, totalScholarships,
      totalUsers, newScholarships7d, newUsers30d
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return { 
      draft: 0, review: 0, published: 0, archived: 0, totalScholarships: 0,
      totalUsers: 0, newScholarships7d: 0, newUsers30d: 0
    };
  }
}

async function getRecentScholarships() {
  try {
    return await prisma.scholarship.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        countries: {
          select: { name: true }
        }
      },
    });
  } catch (error: any) { // Explicitly type error as any
    console.error("Error getting scholarships:", error);
    return [];
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recent = await getRecentScholarships();

  // Main metrics cards (new)
  const mainMetrics = [
    { 
      label: "Total Usuarios", 
      value: stats.totalUsers, 
      icon: Users,
      bgLight: "bg-purple-50",
      textColor: "text-purple-600"
    },
    { 
      label: "Total Becas", 
      value: stats.totalScholarships, 
      icon: GraduationCap,
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    { 
      label: "Becas Nuevas (7d)", 
      value: stats.newScholarships7d, 
      icon: Sparkles,
      bgLight: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      label: "Usuarios Nuevos (30d)", 
      value: stats.newUsers30d, 
      icon: UserPlus,
      bgLight: "bg-pink-50",
      textColor: "text-pink-600"
    },
  ];

  // Scholarship status cards
  const statCards = [
    { 
      label: "Borradores", 
      value: stats.draft, 
      icon: FileEdit, 
      bgLight: "bg-amber-50",
      textColor: "text-amber-600"
    },
    { 
      label: "En Revisión", 
      value: stats.review, 
      icon: Clock, 
      bgLight: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      label: "Publicadas", 
      value: stats.published, 
      icon: CheckCircle, 
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    { 
      label: "Archivadas", 
      value: stats.archived, 
      icon: Archive, 
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
            href="/admin/scholarships"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
          >
            <span>Ver Becas</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Main Metrics - NEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mainMetrics.map((metric) => (
            <div 
              key={metric.label} 
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${metric.bgLight} flex items-center justify-center`}>
                  <metric.icon className={metric.textColor} size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs font-medium text-gray-500">{metric.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scholarship Status Cards */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Estado de Becas</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((card) => (
              <div 
                key={card.label} 
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500">{card.label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg ${card.bgLight} flex items-center justify-center`}>
                    <card.icon className={card.textColor} size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scholarships */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Becas Recientes</h2>
            <Link 
              href="/admin/scholarships"
              className="text-emerald-600 hover:text-emerald-700 font-medium text-xs flex items-center gap-1 transition-colors"
            >
              Ver todas
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map((scholarship: any) => (
              <Link 
                key={scholarship.id}
                href={`/admin/scholarships/${scholarship.id}`}
                className="block p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <GraduationCap size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{scholarship.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        📍 {scholarship.countries[0]?.name || "Sin país"}
                      </p>
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
