import { Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Guardadas</h1>
        <p className="text-gray-500 mt-1">Tus becas favoritas guardadas para después</p>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-pink-50 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <Heart className="text-pink-400" size={36} />
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
    </div>
  );
}
