"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Settings, Menu, X, GraduationCap, BookOpen, Heart, Bell } from "lucide-react";
import SearchBar from "./SearchBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Menu button (mobile) or logo (desktop) */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
            
            {/* Logo - always visible */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white" size={22} />
              </div>
              <span className="hidden sm:inline">BECAS APP</span>
            </Link>
          </div>

          {/* Center: Search (hidden on mobile, shown on tablet+) */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <Link 
              href="/perfil"
              className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            >
              U
            </Link>
          </div>
        </div>
      </header>


      {/* ===== SIDEBAR (Mobile Drawer) ===== */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl 
          transform transition-transform duration-300 ease-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:hidden
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={22} />
            </div>
            <span className="font-bold text-lg text-gray-900">Becas App</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Search (mobile only) */}
        <div className="p-4 border-b border-gray-100">
          <SearchBar />
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
            Navegación
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                ${pathname === item.href
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Usuario</p>
              <p className="text-xs text-gray-500">usuario@email.com</p>
            </div>
          </div>
        </div>
      </aside>


      {/* ===== SIDEBAR (Desktop - Optional, shown as persistent) ===== */}
      {/* Uncomment this block if you want a persistent sidebar on desktop */}
      {/* 
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 pt-18 z-20">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={...}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      */}


      {/* ===== OVERLAY (Mobile) ===== */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}


      {/* ===== MAIN CONTENT ===== */}
      <main className="pt-16 md:pt-18 min-h-screen">
        {/* Container with responsive padding and max-width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Mobile Search (shown only on mobile) */}
          <div className="md:hidden mb-6">
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