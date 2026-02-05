"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Plus,
  User
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/becas", icon: GraduationCap, label: "Becas" },
    { href: "/admin/becas/new", icon: Plus, label: "Nueva Beca" },
    { href: "/admin/users", icon: User, label: "Usuarios" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-emerald-100" size={18} />
          </div>
          <span className="font-bold text-base">Admin Panel</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          shadow-2xl
        `}>
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-3 p-5 border-b border-white/10">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white" size={22} />
            </div>
            <div>
              <span className="font-bold text-base block">Becas App</span>
              <span className="text-xs text-slate-400">Panel Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 mt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Menú Principal
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm
                    ${isActive 
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25" 
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-slate-900/50">
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <div>
                <p className="font-medium text-white text-sm">Gonzalo</p>
                <p className="text-xs text-slate-400">Administrador</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full text-sm"
            >
              <LogOut size={16} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 min-h-screen w-full overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
