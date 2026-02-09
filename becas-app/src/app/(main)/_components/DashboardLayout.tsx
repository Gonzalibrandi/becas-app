"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, User, Heart, Bell, HelpCircle, 
  Menu, X, GraduationCap, ChevronLeft, ChevronRight, LogOut 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Don't show this layout on admin pages
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/", icon: Home, label: "Explorar" },
    { href: "/saved", icon: Heart, label: "Mis Guardadas" },
    { href: "/profile", icon: User, label: "Mi Perfil" },
    { href: "/alerts", icon: Bell, label: "Alertas" },
    { href: "/help", icon: HelpCircle, label: "Ayuda" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* ===== HEADER (Mobile + Desktop) ===== */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-30 shadow-sm">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={22} />
            </div>
            <span className="hidden sm:inline">BECAS APP</span>
          </Link>

          {/* Right side placeholder */}
          <div className="w-10 lg:hidden" />
        </div>
      </header>

      <div className="flex pt-16">
        {/* ===== SIDEBAR (Desktop) ===== */}
        <aside className={`
          hidden lg:flex flex-col
          fixed top-16 left-0 bottom-0 z-20
          bg-white border-r border-gray-200
          transition-all duration-300
          ${sidebarCollapsed ? "w-[52px]" : "w-64"}
        `}>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.disabled ? "#" : item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm
                    ${isActive 
                      ? "bg-emerald-50 text-emerald-700 font-semibold" 
                      : item.disabled 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section: Logout + Collapse */}
          <div className="p-3 border-t border-gray-100 space-y-1">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm
                  text-red-600 hover:bg-red-50
                `}
                title={sidebarCollapsed ? "Cerrar sesión" : undefined}
              >
                <LogOut size={20} />
                {!sidebarCollapsed && <span>Cerrar sesión</span>}
              </button>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm"
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </aside>

        {/* ===== MOBILE SIDEBAR (Drawer) ===== */}
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <GraduationCap className="text-white" size={20} />
                  </div>
                  <span>BECAS APP</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.disabled ? "#" : item.href}
                      onClick={() => !item.disabled && setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? "bg-emerald-50 text-emerald-700 font-semibold" 
                          : item.disabled 
                            ? "text-gray-400 cursor-not-allowed" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                    >
                      <item.icon size={22} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 mt-2"
                  >
                    <LogOut size={22} />
                    <span className="flex-1 text-left">Cerrar sesión</span>
                  </button>
                )}
              </nav>
            </aside>
          </>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <main className={`
          flex-1 min-h-[calc(100vh-4rem)]
          transition-all duration-300
          ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"}
        `}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* ===== BOTTOM NAV (Mobile Only) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-30 lg:hidden safe-area-bottom">
        <div className="h-full grid grid-cols-4 gap-1 px-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={`
                flex flex-col items-center justify-center gap-1 rounded-xl transition-colors
                ${pathname === item.href
                  ? "text-emerald-600"
                  : item.disabled
                    ? "text-gray-300"
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
      <div className="h-16 lg:hidden" />
    </div>
  );
}