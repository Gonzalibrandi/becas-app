import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <SearchX size={40} className="text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Página no encontrada
      </h2>
      <p className="text-gray-500 max-w-md mb-6">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
      >
        <Home size={18} />
        Explorar becas
      </Link>
    </div>
  );
}
