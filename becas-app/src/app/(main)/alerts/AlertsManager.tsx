"use client";

import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Edit2, X, Check, AlertCircle } from "lucide-react";

type Alert = {
  id: string;
  name: string;
  criteria: {
    categories?: string[];
    countries?: string[];
    fundingType?: string;
    educationLevel?: string;
  };
  frequency: "DAILY" | "WEEKLY";
  isActive: boolean;
  createdAt: string;
  lastSentAt?: string;
};

type Category = {
  name: string;
  slug: string;
};

type Props = {
  categories: Category[];
  countries: string[];
};

export default function AlertsManager({ categories, countries }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    frequency: "WEEKLY" as "DAILY" | "WEEKLY",
    categories: [] as string[],
    countries: [] as string[],
    fundingType: "",
    educationLevel: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      frequency: "WEEKLY",
      categories: [],
      countries: [],
      fundingType: "",
      educationLevel: "",
    });
  };

  // Fetch alerts
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/user/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      } else {
        setError("Error al cargar alertas");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Create alert
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/user/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || "Mi Alerta",
          frequency: formData.frequency,
          criteria: {
            categories: formData.categories.length ? formData.categories : undefined,
            countries: formData.countries.length ? formData.countries : undefined,
            fundingType: formData.fundingType || undefined,
            educationLevel: formData.educationLevel || undefined,
          },
        }),
      });

      if (res.ok) {
        await fetchAlerts();
        setIsCreating(false);
        resetForm();
      } else {
        setError("Error al crear alerta");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  // Update alert
  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/user/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          frequency: formData.frequency,
          criteria: {
            categories: formData.categories.length ? formData.categories : undefined,
            countries: formData.countries.length ? formData.countries : undefined,
            fundingType: formData.fundingType || undefined,
            educationLevel: formData.educationLevel || undefined,
          },
        }),
      });

      if (res.ok) {
        await fetchAlerts();
        setEditingId(null);
        resetForm();
      } else {
        setError("Error al actualizar alerta");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  // Delete alert
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta alerta?")) return;

    try {
      const res = await fetch(`/api/user/alerts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== id));
      } else {
        setError("Error al eliminar alerta");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  // Toggle active
  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/user/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setAlerts(alerts.map(a => 
          a.id === id ? { ...a, isActive: !isActive } : a
        ));
      }
    } catch {
      setError("Error de conexión");
    }
  };

  // Start editing
  const startEdit = (alert: Alert) => {
    setEditingId(alert.id);
    setFormData({
      name: alert.name,
      frequency: alert.frequency,
      categories: alert.criteria.categories || [],
      countries: alert.criteria.countries || [],
      fundingType: alert.criteria.fundingType || "",
      educationLevel: alert.criteria.educationLevel || "",
    });
    setIsCreating(false);
  };

  // Cancel
  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  // Toggle multi-select
  const toggleSelection = (field: "categories" | "countries", value: string) => {
    const current = formData[field];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Bell size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Alertas de Becas</h2>
            <p className="text-sm text-gray-500">Recibí notificaciones de nuevas becas</p>
          </div>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
          >
            <Plus size={18} />
            Nueva Alerta
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? "Editar Alerta" : "Nueva Alerta"}
          </h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la alerta
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Becas de Medicina en Europa"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, frequency: "DAILY" })}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    formData.frequency === "DAILY"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  Diaria
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, frequency: "WEEKLY" })}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    formData.frequency === "WEEKLY"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  Semanal
                </button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Áreas de estudio (opcional)
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-white border border-gray-200 rounded-xl">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleSelection("categories", cat.slug)}
                    className={`px-3 py-1 text-sm rounded-full transition-all ${
                      formData.categories.includes(cat.slug)
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Países de destino (opcional)
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-white border border-gray-200 rounded-xl">
                {countries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => toggleSelection("countries", country)}
                    className={`px-3 py-1 text-sm rounded-full transition-all ${
                      formData.countries.includes(country)
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700"
              >
                {editingId ? "Guardar Cambios" : "Crear Alerta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No tenés alertas configuradas</p>
          <p className="text-sm">Creá una para recibir notificaciones de nuevas becas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.isActive 
                  ? "bg-white border-gray-200" 
                  : "bg-gray-50 border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{alert.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      alert.frequency === "DAILY" 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-purple-100 text-purple-600"
                    }`}>
                      {alert.frequency === "DAILY" ? "Diaria" : "Semanal"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {alert.criteria.categories?.map((slug) => (
                      <span key={slug} className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        {categories.find(c => c.slug === slug)?.name || slug}
                      </span>
                    ))}
                    {alert.criteria.countries?.map((country) => (
                      <span key={country} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        📍 {country}
                      </span>
                    ))}
                    {!alert.criteria.categories?.length && !alert.criteria.countries?.length && (
                      <span className="text-xs text-gray-400">Todas las becas</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(alert.id, alert.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.isActive 
                        ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" 
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={alert.isActive ? "Desactivar" : "Activar"}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => startEdit(alert)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
        <strong>Nota:</strong> Las notificaciones por email estarán disponibles próximamente.
      </div>
    </div>
  );
}
