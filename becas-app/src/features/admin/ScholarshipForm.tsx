"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Globe, MapPin, Calendar, DollarSign, BookOpen, Wallet, Save } from "lucide-react";
import { Input, Textarea, Select } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

interface ScholarshipFormProps {
  initialData?: any;
  isEditing?: boolean;
}

const FUNDING_OPTIONS = [
  { value: "FULL", label: "Total (Cubre todo)" },
  { value: "PARTIAL", label: "Parcial" },
  { value: "ONE_TIME", label: "Pago Único" },
  { value: "UNKNOWN", label: "Desconocido" },
];

const EDUCATION_OPTIONS = [
  { value: "UNDERGRADUATE", label: "Grado / Licenciatura" },
  { value: "MASTER", label: "Maestría" },
  { value: "PHD", label: "Doctorado" },
  { value: "RESEARCH", label: "Investigación" },
  { value: "SHORT_COURSE", label: "Curso Corto" },
  { value: "OTHER", label: "Otro" },
];

export default function ScholarshipForm({ initialData, isEditing = false }: ScholarshipFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [error, setError] = useState("");
  const [rawResponse, setRawResponse] = useState<any>(null); // Debug: store raw AI response
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    country: initialData?.country || "",
    deadline: initialData?.deadline?.split("T")[0] || "",
    startDate: initialData?.startDate?.split("T")[0] || "",
    fundingType: initialData?.fundingType || "UNKNOWN",
    educationLevel: initialData?.educationLevel || "OTHER",
    areas: initialData?.areas || "ALL",
    benefits: initialData?.benefits || "",
    requirements: initialData?.requirements || "",
    duration: initialData?.duration || "",
    applyUrl: initialData?.applyUrl || "",
    officialUrl: initialData?.officialUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrape = async () => {
    if (!scrapeUrl) return;
    
    setScraping(true);
    setError("");

    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al scrapear");

      // Debug: store raw response
      setRawResponse(data);
      console.log("🤖 Raw AI Response:", data);

      setFormData({
        title: data.title || "",
        description: data.description || "",
        country: data.country || "",
        deadline: data.deadline || "",
        startDate: data.start_date || "",
        fundingType: data.funding_type || "UNKNOWN",
        educationLevel: data.education_level || "OTHER",
        areas: data.areas || "ALL",
        benefits: data.benefits || "",
        requirements: data.requirements || "",
        duration: data.duracion || "",
        applyUrl: data.apply_url || "",
        officialUrl: data.official_url || "",
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEditing ? `/api/scholarships/${initialData.id}` : "/api/scholarships";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      router.push("/admin/scholarships");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* AI Scraper Section */}
      {!isEditing && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-emerald-600" size={20} />
            <h2 className="font-semibold text-emerald-900">Autocompletar con IA</h2>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Pegá la URL de la beca aquí (ej: https://becas.com/...)"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                leftIcon={<Globe size={18} />}
              />
            </div>
            <Button
              onClick={handleScrape}
              disabled={scraping || !scrapeUrl}
              isLoading={scraping}
              size="lg"
            >
              <Sparkles size={14} />
              {scraping ? "Analizando..." : "Analizar"}
            </Button>
          </div>
          <p className="text-xs text-emerald-600 mt-3">
            * La IA analizará la página y llenará el formulario automáticamente.
          </p>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200 text-red-600">
          {error}
        </Card>
      )}

      {/* Debug Panel: Raw AI Response */}
      {rawResponse && (
        <details className="bg-slate-800 text-slate-100 rounded-xl overflow-hidden">
          <summary className="px-4 py-3 cursor-pointer hover:bg-slate-700 font-mono text-sm flex items-center gap-2">
            🔍 Debug: Ver respuesta raw del LLM
          </summary>
          <pre className="p-4 text-xs overflow-x-auto max-h-96 overflow-y-auto border-t border-slate-700">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </details>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <Card padding="lg">
          <div className="space-y-8">
            {/* Basic Info Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-600" /> Información Básica
              </h3>
              
              <Input
                label="Título de la Beca"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: Beca Chevening 2026"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="País"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Ej: Reino Unido"
                  leftIcon={<MapPin size={16} />}
                />
                
                <Input
                  label="Áreas de Estudio"
                  name="areas"
                  value={formData.areas}
                  onChange={handleChange}
                  placeholder="ENGINEERING, ARTS, o 'ALL'"
                />
              </div>

              <Textarea
                label="Descripción"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Resumen atractivo de la beca..."
                rows={3}
              />
            </section>

            {/* Details Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Wallet size={18} className="text-emerald-600" /> Detalles y Fechas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tipo de Financiamiento"
                  name="fundingType"
                  value={formData.fundingType}
                  onChange={handleChange}
                  options={FUNDING_OPTIONS}
                />

                <Select
                  label="Nivel Educativo"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  options={EDUCATION_OPTIONS}
                />

                <Input
                  label="Fecha Límite"
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  leftIcon={<Calendar size={16} />}
                />
                
                <Input
                  label="Fecha de Inicio"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              
              <Input
                label="Duración"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Ej: 12 meses, 2 años..."
              />
            </section>

            {/* Benefits & Requirements Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Requisitos y Beneficios
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="Beneficios"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Un beneficio por línea..."
                  rows={6}
                  className="font-mono text-sm"
                />
                
                <Textarea
                  label="Requisitos"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Un requisito por línea..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </section>

            {/* URLs Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Globe size={18} className="text-emerald-600" /> Enlaces
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="URL para Aplicar"
                  type="url"
                  name="applyUrl"
                  value={formData.applyUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                
                <Input
                  label="URL Oficial (Organización)"
                  type="url"
                  name="officialUrl"
                  value={formData.officialUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end border-t border-gray-100">
              <Button 
                type="submit" 
                size="lg" 
                disabled={loading}
                isLoading={loading}
              >
                <Save size={20} />
                {isEditing ? "Guardar Cambios" : "Guardar Beca"}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
