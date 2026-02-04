"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Trash2, ExternalLink } from "lucide-react";

type Scholarship = {
  id: string;
  title: string;
  slug: string;
  description: string;
  applyUrl: string | null;
  officialUrl: string | null;
  sourceUrl: string;
  country: string;
  deadline: string | null;
  startDate: string | null;
  fundingType: string;
  educationLevel: string;
  areas: string;
  benefits: string;
  requirements: string;
  duracion: string;
  status: string;
  adminNotes: string | null;
};

type Props = {
  scholarship: Scholarship;
};

// Reusable input styles with high contrast
const inputStyles = `
  w-full px-4 py-3 
  bg-white border-2 border-gray-200 rounded-xl 
  text-gray-900 font-medium placeholder-gray-400
  focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 
  transition-all duration-200 outline-none
`;

const selectStyles = `
  w-full px-4 py-3 
  bg-white border-2 border-gray-200 rounded-xl 
  text-gray-900 font-medium
  focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 
  transition-all duration-200 outline-none
  cursor-pointer
`;

const textareaStyles = `
  w-full px-4 py-3 
  bg-white border-2 border-gray-200 rounded-xl 
  text-gray-900 font-medium placeholder-gray-400
  focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 
  transition-all duration-200 outline-none
  resize-y
`;

const labelStyles = "block text-sm font-semibold text-gray-700 mb-2";

export default function ScholarshipForm({ scholarship }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: scholarship.title,
    slug: scholarship.slug,
    description: scholarship.description,
    apply_url: scholarship.applyUrl || "",
    official_url: scholarship.officialUrl || "",
    source_url: scholarship.sourceUrl,
    country: scholarship.country,
    deadline: scholarship.deadline?.split("T")[0] || "",
    start_date: scholarship.startDate?.split("T")[0] || "",
    funding_type: scholarship.fundingType,
    education_level: scholarship.educationLevel,
    areas: scholarship.areas,
    benefits: scholarship.benefits,
    requirements: scholarship.requirements,
    duracion: scholarship.duracion,
    status: scholarship.status,
    admin_notes: scholarship.adminNotes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/scholarships/${scholarship.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push("/admin/becas");
        router.refresh();
      } else {
        alert("Error al guardar");
      }
    } catch {
      alert("Error de conexión");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar esta beca?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/scholarships/${scholarship.id}`, { method: "DELETE" });
      router.push("/admin/becas");
      router.refresh();
    } catch {
      alert("Error al eliminar");
    }
    setDeleting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 flex items-center gap-2 disabled:opacity-50 font-medium transition-all"
          >
            <Trash2 size={16} />
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 font-medium shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Save size={16} />
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              📝 Información Principal
            </h2>
            
            <div>
              <label className={labelStyles}>Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>

            <div>
              <label className={labelStyles}>Slug (URL)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`${inputStyles} font-mono text-sm`}
                required
              />
            </div>

            <div>
              <label className={labelStyles}>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={textareaStyles}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>País</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className={labelStyles}>Duración</label>
                <input
                  type="text"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              📋 Detalles
            </h2>
            
            <div>
              <label className={labelStyles}>Áreas</label>
              <input
                type="text"
                name="areas"
                value={formData.areas}
                onChange={handleChange}
                className={inputStyles}
                placeholder="Ej: Ingeniería, Tecnología, Ciencias"
              />
            </div>

            <div>
              <label className={labelStyles}>Beneficios</label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={3}
                className={textareaStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>Requisitos</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                className={textareaStyles}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              🔗 Enlaces
            </h2>
            
            <div>
              <label className={labelStyles}>
                URL de Aplicación
                {formData.apply_url && (
                  <a href={formData.apply_url} target="_blank" className="ml-2 text-emerald-600 hover:text-emerald-700">
                    <ExternalLink size={14} className="inline" />
                  </a>
                )}
              </label>
              <input
                type="url"
                name="apply_url"
                value={formData.apply_url}
                onChange={handleChange}
                className={inputStyles}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className={labelStyles}>URL Oficial (Fundación)</label>
              <input
                type="url"
                name="official_url"
                value={formData.official_url}
                onChange={handleChange}
                className={inputStyles}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className={labelStyles}>URL Fuente (Scraping)</label>
              <input
                type="url"
                name="source_url"
                value={formData.source_url}
                onChange={handleChange}
                className={`${inputStyles} bg-gray-50 cursor-not-allowed`}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              ⚙️ Estado
            </h2>
            
            <div>
              <label className={labelStyles}>Estado de Publicación</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="DRAFT">✏️ Borrador</option>
                <option value="REVIEW">👁️ En Revisión</option>
                <option value="PUBLISHED">✅ Publicada</option>
                <option value="ARCHIVED">📦 Archivada</option>
              </select>
            </div>

            <div>
              <label className={labelStyles}>Tipo de Financiamiento</label>
              <select
                name="funding_type"
                value={formData.funding_type}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="FULL">💰 Cobertura Total</option>
                <option value="PARTIAL">💵 Parcial</option>
                <option value="ONE_TIME">💸 Pago Único</option>
                <option value="UNKNOWN">❔ Desconocido</option>
              </select>
            </div>

            <div>
              <label className={labelStyles}>Nivel Educativo</label>
              <select
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="UNDERGRADUATE">🎓 Grado / Licenciatura</option>
                <option value="MASTER">📚 Maestría</option>
                <option value="PHD">🔬 Doctorado</option>
                <option value="RESEARCH">🧪 Investigación</option>
                <option value="SHORT_COURSE">📖 Curso Corto</option>
                <option value="OTHER">📄 Otro</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              📅 Fechas
            </h2>
            
            <div>
              <label className={labelStyles}>Fecha Límite</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>Fecha de Inicio</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              📝 Notas Admin
            </h2>
            <textarea
              name="admin_notes"
              value={formData.admin_notes}
              onChange={handleChange}
              rows={4}
              className={textareaStyles}
              placeholder="Notas internas..."
            />
          </div>
        </div>
      </div>
    </form>
  );
}
