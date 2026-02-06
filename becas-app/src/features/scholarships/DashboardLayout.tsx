"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Settings, Menu, X, GraduationCap, BookOpen, Heart, Bell } from "lucide-react";
import SearchBar from "../../components/SearchBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show this layout on admin pages
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/favoritos", icon: Heart, label: "Favoritos" },
    { href: "/perfil", icon: User, label: "Mi Perfil" },
    { href: "/configuracion", icon: Settings, label: "Configuración" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* ===== HEADER (Mobile + Desktop) ===== */}
      <header className="fixed top-0 left-0 right-0 h-16 md:h-18 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={22} />
            </div>
            <span>BECAS APP</span>
          </Link>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pt-16 md:pt-18 min-h-screen">
        {/* Container with responsive padding and max-width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Mobile Search (shown only on mobile) */}
          <div className="mb-6">
            <SearchBar />
          </div>

          {/* Page Content */}
          {children}
        </div>
      </main>


      {/* ===== BOTTOM NAV (Mobile Only) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-30 md:hidden safe-area-bottom">
        <div className="h-full grid grid-cols-4 gap-1 px-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 rounded-xl transition-colors
                ${pathname === item.href
                  ? "text-emerald-600"
                  : "text-gray-400 hover:text-gray-600"
                }
              `}
            >
              <item.icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}