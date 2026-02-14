"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Globe, MapPin, Calendar, BookOpen, Wallet, Save, Plus, X, Tag, Star } from "lucide-react";
import { Input, Textarea, Select, Button, Card } from "@/components/ui";
import { CATEGORIES } from "@/lib/utils/categories";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Country = {
  id: string;
  name: string;
  slug: string;
};

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
  const [rawResponse, setRawResponse] = useState<any>(null);

  // Categories state
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categories?.map((c: Category) => c.id) || []
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Countries state
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>(
    initialData?.countries?.map((c: Country) => c.id) || []
  );
  const [newCountryName, setNewCountryName] = useState("");
  const [creatingCountry, setCreatingCountry] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    deadline: initialData?.deadline?.split("T")[0] || "",
    startDate: initialData?.startDate?.split("T")[0] || "",
    fundingType: initialData?.fundingType || "UNKNOWN",
    educationLevel: initialData?.educationLevel || "OTHER",
    benefits: initialData?.benefits || "",
    requirements: initialData?.requirements || "",
    duration: initialData?.duration || "",
    applyUrl: initialData?.applyUrl || "",
    officialUrl: initialData?.officialUrl || "",
    isRecommended: initialData?.isRecommended || false,
  });

  // Fetch categories on mount
  // Fetch categories and countries on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/countries").then((res) => res.json())
    ])
      .then(([cats, countries]) => {
        setAllCategories(cats);
        setAllCountries(countries);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setCreatingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const cat: Category = await res.json();

      // Add to list if not already present
      setAllCategories((prev) =>
        prev.find((c) => c.id === cat.id) ? prev : [...prev, cat].sort((a, b) => a.name.localeCompare(b.name))
      );
      // Auto-select the new/existing category
      setSelectedCategoryIds((prev) =>
        prev.includes(cat.id) ? prev : [...prev, cat.id]
      );
      setNewCategoryName("");
    } catch (err) {
      console.error("Failed to create category:", err);
    } finally {
      setCreatingCategory(false);
    }
  };

  const toggleCountry = (id: string) => {
    setSelectedCountryIds((prev) => 
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleCreateCountry = async () => {
    const name = newCountryName.trim();
    if (!name) return;

    setCreatingCountry(true);
    try {
      const res = await fetch("/api/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const country: Country = await res.json();

      setAllCountries((prev) =>
        prev.find((c) => c.id === country.id) ? prev : [...prev, country].sort((a, b) => a.name.localeCompare(b.name))
      );
      
      // Auto-select
      toggleCountry(country.id);
      setNewCountryName("");
    } catch (err) {
      console.error("Failed to create country:", err);
    } finally {
      setCreatingCountry(false);
    }
  };

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

      // Auto-select countries if they match existing ones
      const scrapedCountries = (data.country || "").split(",").map((c: string) => c.trim()).filter(Boolean);
      const foundCountryIds = allCountries
        .filter(c => scrapedCountries.some(sc => 
          sc.toLowerCase() === c.name.toLowerCase() || 
          sc.toLowerCase() === c.slug.toLowerCase()
        ))
        .map(c => c.id);

      if (foundCountryIds.length > 0) {
        setSelectedCountryIds(foundCountryIds);
      }

      // Check for missing countries
      const missingCountries = scrapedCountries.filter(sc => 
        !allCountries.some(c => 
          c.name.toLowerCase() === sc.toLowerCase() || 
          c.slug.toLowerCase() === sc.toLowerCase()
        )
      );

      if (missingCountries.length > 0) {
        setNewCountryName(missingCountries[0]); // Propose the first missing country
        // Optionally notify user via console or UI
        console.log("Missing countries:", missingCountries);
      }

      // Auto-select categories
      if (data.category_slugs && Array.isArray(data.category_slugs)) {
        const foundCategoryIds = allCategories
          .filter(c => data.category_slugs.includes(c.slug))
          .map(c => c.id);
        
        if (foundCategoryIds.length > 0) {
          setSelectedCategoryIds(foundCategoryIds);
        }

        // Suggest missing categories (using Name from constant)
        const missingSlugs = data.category_slugs.filter((slug: string) => 
          !allCategories.some(c => c.slug === slug)
        );

        if (missingSlugs.length > 0) {
          const firstMissingSlug = missingSlugs[0];
          const definition = CATEGORIES.find(c => c.slug === firstMissingSlug);
          if (definition) {
             setNewCategoryName(definition.name);
          }
        }
      }

      setFormData({
        title: data.title || "",
        description: data.description || "",
        deadline: data.deadline || "",
        startDate: data.start_date || "",
        fundingType: data.funding_type || "UNKNOWN",
        educationLevel: data.education_level || "OTHER",
        benefits: data.benefits || "",
        requirements: data.requirements || "",
        duration: data.duration || "",
        applyUrl: data.apply_url || "",
        officialUrl: data.official_url || "",
        isRecommended: false,
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
        body: JSON.stringify({ 
          ...formData, 
          categoryIds: selectedCategoryIds,
          countryIds: selectedCountryIds 
        }),
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
          <summary className="px-4 py-3 cursor-pointer hover:bg-slate-700 font-mono text-sm flex items-center justify-between font-bold text-emerald-400">
            <span>✨ Datos Extraídos por IA (Haz Clic Para Ver Todo)</span>
            <span className="text-xs text-slate-400">JSON RAW</span>
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

              <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <input
                  type="checkbox"
                  name="isRecommended"
                  id="isRecommended"
                  checked={formData.isRecommended}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecommended: e.target.checked }))}
                  className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="isRecommended" className="text-sm font-medium text-gray-700 select-none cursor-pointer flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={18} />
                   Marcar como <strong>Recomendada</strong> (Aparecerá destacada en el listado)
                </label>
              </div>

              {/* Country Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={14} className="inline mr-1.5 text-emerald-600" />
                  País(es)
                </label>

                {/* Selected + available chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {allCountries.map((country) => {
                    const selected = selectedCountryIds.includes(country.id);
                    return (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => toggleCountry(country.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          selected
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {country.name}
                        {selected && <X size={14} />}
                      </button>
                    );
                  })}
                </div>

                {/* Create new country */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      value={newCountryName}
                      onChange={(e) => setNewCountryName(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCountry();
                        }
                      }}
                      placeholder="Nuevo país..."
                      leftIcon={<Plus size={16} />}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateCountry}
                    disabled={!newCountryName.trim() || creatingCountry}
                    isLoading={creatingCountry}
                  >
                    <Plus size={16} />
                    Crear
                  </Button>
                </div>
                
                {/* Fallback legacy input (hidden or read-only if desired, but kept for debug) */}
                {/* <div className="mt-2 text-xs text-gray-400">Legacy String: {formData.country}</div> */}
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={14} className="inline mr-1.5 text-emerald-600" />
                  Categorías
                </label>

                {/* Selected + available chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {allCategories.map((cat) => {
                    const selected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          selected
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {cat.name}
                        {selected && <X size={14} />}
                      </button>
                    );
                  })}
                  {allCategories.length === 0 && (
                    <span className="text-sm text-gray-400">Cargando categorías...</span>
                  )}
                </div>

                {/* Create new category */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                      placeholder="Nueva categoría..."
                      leftIcon={<Plus size={16} />}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || creatingCategory}
                    isLoading={creatingCategory}
                  >
                    <Plus size={16} />
                    Crear
                  </Button>
                </div>
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
