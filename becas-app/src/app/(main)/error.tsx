"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Algo salió mal
      </h2>
      <p className="text-gray-500 max-w-md mb-6">
        Ocurrió un error inesperado. Por favor intentá de nuevo.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
      >
        <RefreshCw size={18} />
        Reintentar
      </button>
    </div>
  );
}
