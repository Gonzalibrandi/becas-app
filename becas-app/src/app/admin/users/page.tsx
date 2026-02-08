import AdminLayout from "../_components/AdminLayout";
import prisma from "@/lib/db/prisma";
import UsersClient from "./_components/UsersClient";
import { Users, UserCheck, UserX } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

async function getUserStats() {
  try {
    const [total, active, banned] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
    ]);
    return { total, active, banned };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { total: 0, active: 0, banned: 0 };
  }
}

export default async function UsersPage() {
  const [users, stats] = await Promise.all([
    getUsers(),
    getUserStats(),
  ]);

  const statCards = [
    { label: "Total", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Activos", value: stats.active, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Baneados", value: stats.banned, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Administra los usuarios registrados en la plataforma</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <UsersClient users={users} />
      </div>
    </AdminLayout>
  );
}
