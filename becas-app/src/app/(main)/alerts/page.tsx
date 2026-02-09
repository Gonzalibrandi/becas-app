import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import prisma from "@/lib/db/prisma";
import AlertsManager from "./AlertsManager";
import { Bell } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getAlertData() {
  const [categories, scholarships] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { name: true, slug: true }
    }),
    prisma.scholarship.findMany({
      where: { status: "PUBLISHED" },
      select: { country: true },
      distinct: ["country"],
    })
  ]);

  const countries = scholarships
    .map((s: { country: string | null }) => s.country)
    .filter((c): c is string => Boolean(c))
    .sort();

  return { categories, countries };
}

export default async function AlertsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/alerts");
  }

  const { categories, countries } = await getAlertData();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/25">
          <Bell size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas de Becas</h1>
          <p className="text-gray-500">Recibí notificaciones cuando haya nuevas becas</p>
        </div>
      </div>

      {/* Alerts Manager */}
      <AlertsManager categories={categories} countries={countries} />
    </div>
  );
}
