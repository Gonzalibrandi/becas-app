"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Heart } from "lucide-react";
import { getFundingInfo } from "@/lib/utils/constants";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/app/(auth)/_components/AuthModal";

type ScholarshipCardProps = {
  scholarship: {
    id: string;
    title: string;
    slug: string;
    country: string | null;
    deadline: Date | null;
    fundingType: string;
    description: string | null;
  };
};

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const funding = getFundingInfo(scholarship.fundingType);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // TODO: Implement actual favorite toggle with API
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <Link 
        href={`/scholarship/${scholarship.slug}`} 
        className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden relative"
      >
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 ${
            isFavorite
              ? "bg-rose-100 text-rose-500"
              : "bg-white/80 text-gray-400 hover:bg-rose-50 hover:text-rose-500"
          } shadow-sm backdrop-blur-sm`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            size={18}
            className={isFavorite ? "fill-current" : ""}
          />
        </button>

        {/* Card Top */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        {/* Card Content */}
        <div className="p-5 sm:p-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3 pr-10">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${funding.style}`}>
              {funding.label}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors mb-3 pr-8">
            {scholarship.title}
          </h2>
          
          {/* Description preview */}
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {scholarship.description || "Ver más detalles sobre esta beca..."}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              {scholarship.country || "Internacional"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {scholarship.deadline 
                ? new Date(scholarship.deadline).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                : 'Sin fecha'
              }
            </span>
          </div>

          {/* CTA */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
              Ver detalles
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

