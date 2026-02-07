"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ExternalLink, GraduationCap } from "lucide-react";
import { Button, Card, SectionHeader, StatusBadge } from "@/components";
import BulkActions from "@/features/admin/BulkActions";

interface Scholarship {
  id: string;
  title: string;
  slug: string;
  status: string;
  country: string;
  deadline: string | null;
  educationLevel: string;
}

interface AdminBecasClientProps {
  scholarships: Scholarship[];
  currentStatus: string;
  searchQuery: string;
}

const statusFilters = [
  { value: "all", label: "Todas" },
  { value: "DRAFT", label: "Borrador" },
  { value: "REVIEW", label: "Revisión" },
  { value: "PUBLISHED", label: "Publicadas" },
  { value: "ARCHIVED", label: "Archivadas" },
];

export default function AdminBecasClient({ 
  scholarships, 
  currentStatus, 
  searchQuery 
}: AdminBecasClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedIds.length === scholarships.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(scholarships.map(s => s.id));
    }
  };

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleActionComplete = useCallback(() => {
    router.refresh();
  }, [router]);

  const allSelected = scholarships.length > 0 && selectedIds.length === scholarships.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < scholarships.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <SectionHeader
        title="Becas"
        subtitle="Gestiona todas las becas del sistema"
      >
        <div className="flex gap-2">
          <Button href="/admin/scholarships/import-from-argentina-government" variant="outline" size="md" className="hover:border-emerald-300 hover:bg-emerald-100 transition-all group">
            <GraduationCap size={18}/>
            <span>Importar Argentina.gob.ar</span>
          </Button>
          <Button href="/admin/scholarships/add-scholarship" variant="primary" size="md">
            <Plus size={18} />
            <span>Nueva Beca</span>
          </Button>
        </div>
      </SectionHeader>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          {/* Search */}
          <form className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Buscar becas..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
            {statusFilters.map((filter) => (
              <Link
                key={filter.value}
                href={`/admin/scholarships?status=${filter.value}${searchQuery ? `&search=${searchQuery}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  currentStatus === filter.value
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </Card>

      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-3">
        {scholarships.map((s) => (
          <div
            key={s.id}
            className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${
              selectedIds.includes(s.id) ? "border-emerald-500" : "border-slate-200"
            }`}
          >
            <div className="flex items-center p-4 gap-3">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.includes(s.id)}
                onChange={() => toggleSelection(s.id)}
                className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 flex-shrink-0"
              />
              
              {/* Content - clickable */}
              <Link href={`/admin/scholarships/${s.id}`} className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{s.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">📍 {s.country}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 ml-13">
                  <span>{s.educationLevel}</span>
                  <span>•</span>
                  <span>{s.deadline ? new Date(s.deadline).toLocaleDateString("es-AR") : "Sin fecha"}</span>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card padding="none" className="hidden lg:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleAllSelection}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">País</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nivel</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scholarships.map((s) => (
                <tr 
                  key={s.id} 
                  className={`transition-colors ${
                    selectedIds.includes(s.id) ? "bg-emerald-50" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleSelection(s.id)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 truncate max-w-xs">{s.title}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">{s.country}</td>
                  <td className="px-4 py-3 text-slate-600 text-sm">{s.educationLevel}</td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {s.deadline ? new Date(s.deadline).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button href={`/admin/scholarships/${s.id}`} variant="ghost" size="sm">
                        Editar
                      </Button>
                      <Link
                        href={`/scholarship/${s.slug}`}
                        target="_blank"
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {scholarships.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No se encontraron becas
          </div>
        )}
      </Card>

      {/* Empty state for mobile */}
      {scholarships.length === 0 && (
        <Card padding="lg" className="lg:hidden text-center text-slate-500">
          No se encontraron becas
        </Card>
      )}

      <p className="text-xs sm:text-sm text-slate-500 text-center">
        Mostrando {scholarships.length} becas
        {selectedIds.length > 0 && ` · ${selectedIds.length} seleccionadas`}
      </p>

      {/* Bulk Actions Bar */}
      <BulkActions 
        selectedIds={selectedIds}
        onClearSelection={clearSelection}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}
