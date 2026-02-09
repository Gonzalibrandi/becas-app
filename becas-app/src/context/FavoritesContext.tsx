"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

type FavoritesContextType = {
  favoriteIds: Set<string>;
  isLoading: boolean;
  isFavorite: (scholarshipId: string) => boolean;
  toggleFavorite: (scholarshipId: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load all favorites once when user is authenticated
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/favorites");
      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>(data.map((s: { id: string }) => s.id));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // Check if a scholarship is favorited (instant, no API call)
  const isFavorite = useCallback((scholarshipId: string): boolean => {
    return favoriteIds.has(scholarshipId);
  }, [favoriteIds]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (scholarshipId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const wasFavorite = favoriteIds.has(scholarshipId);
    const method = wasFavorite ? "DELETE" : "POST";

    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (wasFavorite) {
        next.delete(scholarshipId);
      } else {
        next.add(scholarshipId);
      }
      return next;
    });

    try {
      const res = await fetch("/api/user/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scholarshipId }),
      });

      if (!res.ok) {
        // Revert on failure
        setFavoriteIds(prev => {
          const next = new Set(prev);
          if (wasFavorite) {
            next.add(scholarshipId);
          } else {
            next.delete(scholarshipId);
          }
          return next;
        });
        return false;
      }

      return true;
    } catch {
      // Revert on error
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (wasFavorite) {
          next.add(scholarshipId);
        } else {
          next.delete(scholarshipId);
        }
        return next;
      });
      return false;
    }
  }, [isAuthenticated, favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ 
      favoriteIds, 
      isLoading, 
      isFavorite, 
      toggleFavorite,
      refreshFavorites 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
