import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import prisma from "@/lib/db/prisma";
import ScholarshipCard from "../_components/ScholarshipCard";
import { Heart, GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getFavorites(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedScholarships: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            deadline: true,
            fundingType: true,
            educationLevel: true,
            description: true,
            categories: { select: { name: true, slug: true } },
            countries: { select: { name: true } },
          }
        }
      }
    });

    return user?.savedScholarships || [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
}

export default async function SavedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/saved");
  }

  const favorites = await getFavorites(user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg shadow-rose-500/25">
          <Heart size={24} className="text-white fill-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Guardadas</h1>
          <p className="text-gray-500">
            {favorites.length} beca{favorites.length !== 1 ? "s" : ""} guardada{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Favorites Grid or Empty State */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {favorites.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <GraduationCap className="text-pink-400" size={36} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No tenés becas guardadas
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Explorá las becas disponibles y guardá las que más te interesen para verlas después.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
          >
            <Sparkles size={18} />
            Explorar Becas
          </Link>
        </div>
      )}
    </div>
  );
}
