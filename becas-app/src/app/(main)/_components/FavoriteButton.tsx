"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import AuthModal from "@/app/(auth)/_components/AuthModal";

type FavoriteButtonProps = {
  scholarshipId: string;
  /** Variant for different layouts: 'card' for ScholarshipCard, 'detail' for detail page */
  variant?: "card" | "detail";
  className?: string;
};

export default function FavoriteButton({ 
  scholarshipId, 
  variant = "detail",
  className = "" 
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const favorite = isFavorite(scholarshipId);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    await toggleFavorite(scholarshipId);
    setIsToggling(false);
  };

  const baseStyles = variant === "card" 
    ? `p-2 rounded-full transition-all duration-200 shadow-sm ${
        favorite
          ? "bg-rose-100 text-rose-500"
          : "bg-white/90 text-gray-400 hover:bg-rose-50 hover:text-rose-500"
      }`
    : `flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
        favorite 
          ? "border-red-300 bg-red-50 text-red-500" 
          : "border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
      }`;

  const showLoading = isLoading || isToggling;

  return (
    <>
      <button
        onClick={handleFavoriteClick}
        disabled={showLoading}
        className={`${baseStyles} ${className} focus:outline-none ${showLoading ? 'opacity-50 cursor-wait' : ''}`}
        aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <Heart size={18} className={favorite ? "fill-current" : ""} />
        {variant === "detail" && (
          <span className="text-sm font-medium">
            {isToggling ? '...' : favorite ? 'Guardada' : 'Guardar'}
          </span>
        )}
      </button>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
