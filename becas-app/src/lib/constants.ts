// Shared constants for the application

export const FUNDING_TYPES = [
  { value: "FULL", label: "Cobertura Total", icon: "💰", style: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "PARTIAL", label: "Parcial", icon: "💵", style: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "ONE_TIME", label: "Pago Único", icon: "💸", style: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "UNKNOWN", label: "Ver detalles", icon: "❔", style: "bg-gray-100 text-gray-600 border-gray-200" },
] as const;

export const EDUCATION_LEVELS = [
  { value: "UNDERGRADUATE", label: "Grado / Licenciatura", icon: "🎓" },
  { value: "MASTER", label: "Maestría", icon: "📚" },
  { value: "PHD", label: "Doctorado", icon: "🔬" },
  { value: "RESEARCH", label: "Investigación", icon: "🧪" },
  { value: "SHORT_COURSE", label: "Curso Corto", icon: "📖" },
  { value: "OTHER", label: "Varios niveles", icon: "📄" },
] as const;

// Helper to get funding info by type
export function getFundingInfo(type: string) {
  return FUNDING_TYPES.find(f => f.value === type) || FUNDING_TYPES[3]; // Default to UNKNOWN
}

// Helper to get education info by level  
export function getEducationInfo(level: string) {
  return EDUCATION_LEVELS.find(e => e.value === level) || EDUCATION_LEVELS[5]; // Default to OTHER
}

// Type exports for TypeScript
export type FundingType = typeof FUNDING_TYPES[number]['value'];
export type EducationLevel = typeof EDUCATION_LEVELS[number]['value'];
