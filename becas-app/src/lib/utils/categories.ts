// Categories for scholarship classification
// These match the Category model in the database

export interface CategoryDefinition {
  name: string;
  slug: string;
  keywords: string[];
  examples: string[];
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    name: 'Administración',
    slug: 'administracion',
    keywords: ['administración', 'gestión', 'management', 'recursos humanos', 'rrhh'],
    examples: ['MBA', 'Gestión de empresas', 'Administración pública', 'Recursos humanos'],
  },
  {
    name: 'Negocios y Finanzas',
    slug: 'negocios-finanzas',
    keywords: ['negocios', 'finanzas', 'business', 'comercio', 'banca', 'inversiones'],
    examples: ['Comercio internacional', 'Banca', 'Finanzas corporativas', 'Emprendimiento'],
  },
  {
    name: 'Economía',
    slug: 'economia',
    keywords: ['economía', 'economics', 'macroeconomía', 'microeconomía', 'desarrollo económico'],
    examples: ['Economía aplicada', 'Desarrollo económico', 'Economía internacional'],
  },
  {
    name: 'Agricultura',
    slug: 'agricultura',
    keywords: ['agricultura', 'agronomía', 'agroindustria', 'cultivos', 'ganadería', 'desarrollo rural'],
    examples: ['Ingeniería agronómica', 'Agricultura sostenible', 'Desarrollo rural'],
  },
  {
    name: 'Medio Ambiente',
    slug: 'medio-ambiente',
    keywords: ['medio ambiente', 'environment', 'ecología', 'sustentabilidad', 'cambio climático', 'recursos naturales'],
    examples: ['Gestión ambiental', 'Cambio climático', 'Conservación', 'Recursos hídricos'],
  },
  {
    name: 'Arquitectura y Construcción',
    slug: 'arquitectura-construccion',
    keywords: ['arquitectura', 'construcción', 'urbanismo', 'planeamiento urbano', 'diseño urbano'],
    examples: ['Arquitectura', 'Urbanismo', 'Ingeniería civil', 'Planificación urbana'],
  },
  {
    name: 'Arte y Cultura',
    slug: 'arte-cultura',
    keywords: ['arte', 'artes', 'cultura', 'bellas artes', 'cine', 'teatro', 'música', 'danza'],
    examples: ['Bellas artes', 'Cine', 'Teatro', 'Música', 'Artes visuales', 'Escritura creativa'],
  },
  {
    name: 'Diseño',
    slug: 'diseno',
    keywords: ['diseño', 'design', 'diseño gráfico', 'diseño industrial', 'ux', 'ui'],
    examples: ['Diseño gráfico', 'Diseño industrial', 'Diseño de moda', 'Diseño de interiores'],
  },
  {
    name: 'Ciencias Naturales',
    slug: 'ciencias-naturales',
    keywords: ['ciencias', 'biología', 'química', 'física', 'ciencias naturales', 'ciencias puras'],
    examples: ['Biología', 'Química', 'Física', 'Bioquímica', 'Ciencias de la vida'],
  },
  {
    name: 'Geociencias',
    slug: 'geociencias',
    keywords: ['geología', 'geofísica', 'geociencias', 'meteorología', 'oceanografía', 'sismología'],
    examples: ['Geología', 'Geofísica', 'Oceanografía', 'Ciencias de la tierra'],
  },
  {
    name: 'Ciencias Sociales',
    slug: 'ciencias-sociales',
    keywords: ['ciencias sociales', 'sociología', 'antropología', 'trabajo social'],
    examples: ['Sociología', 'Antropología', 'Trabajo social', 'Estudios sociales'],
  },
  {
    name: 'Psicología y Criminología',
    slug: 'psicologia-criminologia',
    keywords: ['psicología', 'criminología', 'psychology', 'salud mental', 'neurociencia'],
    examples: ['Psicología clínica', 'Criminología', 'Neuropsicología', 'Psicología organizacional'],
  },
  {
    name: 'Derecho',
    slug: 'derecho',
    keywords: ['derecho', 'leyes', 'law', 'jurídico', 'legal', 'abogacía'],
    examples: ['Derecho internacional', 'Derecho penal', 'Derecho civil', 'Derecho corporativo'],
  },
  {
    name: 'Derechos Humanos',
    slug: 'derechos-humanos',
    keywords: ['derechos humanos', 'human rights', 'libertades', 'justicia social'],
    examples: ['Derechos humanos internacionales', 'Justicia transicional', 'Refugiados'],
  },
  {
    name: 'Educación',
    slug: 'educacion',
    keywords: ['educación', 'pedagogía', 'education', 'enseñanza', 'didáctica'],
    examples: ['Ciencias de la educación', 'Pedagogía', 'Educación superior'],
  },
  {
    name: 'Formación Docente',
    slug: 'formacion-docente',
    keywords: ['formación docente', 'teacher training', 'enseñanza', 'profesorado', 'docencia'],
    examples: ['TESOL', 'Enseñanza de idiomas', 'Formación de profesores', 'Didáctica'],
  },
  {
    name: 'Arqueología',
    slug: 'arqueologia',
    keywords: ['arqueología', 'archaeology', 'excavación', 'prehistoria', 'egiptología'],
    examples: ['Arqueología clásica', 'Egiptología', 'Prehistoria', 'Arqueología mesoamericana'],
  },
  {
    name: 'Estudios Orientales',
    slug: 'estudios-orientales',
    keywords: ['estudios asiáticos', 'estudios orientales', 'japonés', 'chino', 'coreano', 'árabe', 'islam'],
    examples: ['Estudios japoneses', 'Estudios chinos', 'Estudios islámicos', 'Estudios coreanos'],
  },
  {
    name: 'Estudios Religiosos',
    slug: 'estudios-religiosos',
    keywords: ['religión', 'teología', 'estudios religiosos', 'religious studies'],
    examples: ['Teología', 'Estudios bíblicos', 'Religiones comparadas'],
  },
  {
    name: 'Historia',
    slug: 'historia',
    keywords: ['historia', 'history', 'histórico', 'historia del arte'],
    examples: ['Historia moderna', 'Historia del arte', 'Historia contemporánea', 'Historia antigua'],
  },
  {
    name: 'Humanidades',
    slug: 'humanidades',
    keywords: ['humanidades', 'humanities', 'filosofía', 'literatura', 'ética'],
    examples: ['Filosofía', 'Literatura', 'Ética', 'Estudios culturales'],
  },
  {
    name: 'Idiomas y Traducción',
    slug: 'idiomas-traduccion',
    keywords: ['idiomas', 'traducción', 'interpretación', 'lingüística', 'languages'],
    examples: ['Traducción e interpretación', 'Lingüística aplicada', 'Lenguas extranjeras'],
  },
  {
    name: 'Comunicación y Periodismo',
    slug: 'comunicacion-periodismo',
    keywords: ['comunicación', 'periodismo', 'journalism', 'medios', 'media', 'relaciones públicas'],
    examples: ['Periodismo', 'Comunicación social', 'Medios digitales', 'Relaciones públicas'],
  },
  {
    name: 'Ingeniería',
    slug: 'ingenieria',
    keywords: ['ingeniería', 'engineering', 'ingeniero', 'mecánica', 'eléctrica', 'civil', 'industrial'],
    examples: ['Ingeniería mecánica', 'Ingeniería eléctrica', 'Ingeniería civil', 'Ingeniería industrial'],
  },
  {
    name: 'Tecnología e Informática',
    slug: 'tecnologia-informatica',
    keywords: ['tecnología', 'informática', 'computer science', 'software', 'programación', 'ti', 'tic'],
    examples: ['Ciencias de la computación', 'Desarrollo de software', 'Inteligencia artificial', 'Ciberseguridad'],
  },
  {
    name: 'Energías Renovables',
    slug: 'energias-renovables',
    keywords: ['energía renovable', 'solar', 'eólica', 'clean energy', 'sostenibilidad energética'],
    examples: ['Energía solar', 'Energía eólica', 'Eficiencia energética', 'Tecnologías limpias'],
  },
  {
    name: 'Transporte y Logística',
    slug: 'transporte-logistica',
    keywords: ['transporte', 'logística', 'logistics', 'supply chain', 'cadena de suministro'],
    examples: ['Logística internacional', 'Gestión de transporte', 'Cadena de suministro'],
  },
  {
    name: 'Matemáticas',
    slug: 'matematicas',
    keywords: ['matemáticas', 'mathematics', 'estadística', 'álgebra', 'cálculo'],
    examples: ['Matemáticas aplicadas', 'Estadística', 'Matemáticas puras', 'Actuaría'],
  },
  {
    name: 'Medicina',
    slug: 'medicina',
    keywords: ['medicina', 'medicine', 'médico', 'cirugía', 'farmacia', 'enfermería', 'odontología'],
    examples: ['Medicina general', 'Cirugía', 'Farmacia', 'Enfermería', 'Odontología'],
  },
  {
    name: 'Salud Pública',
    slug: 'salud-publica',
    keywords: ['salud pública', 'public health', 'epidemiología', 'políticas de salud'],
    examples: ['Epidemiología', 'Gestión hospitalaria', 'Políticas de salud', 'Salud global'],
  },
  {
    name: 'Minería',
    slug: 'mineria',
    keywords: ['minería', 'mining', 'extracción', 'recursos minerales', 'metalurgia'],
    examples: ['Ingeniería de minas', 'Metalurgia', 'Geología minera'],
  },
  {
    name: 'Políticas Públicas y Gobierno',
    slug: 'politicas-gobierno',
    keywords: ['políticas públicas', 'gobierno', 'government', 'public policy', 'administración pública'],
    examples: ['Políticas públicas', 'Gobernanza', 'Administración gubernamental', 'Relaciones internacionales'],
  },
  {
    name: 'Turismo y Hospitalidad',
    slug: 'turismo-hospitalidad',
    keywords: ['turismo', 'hotelería', 'hospitality', 'tourism', 'gestión hotelera'],
    examples: ['Turismo sostenible', 'Gestión hotelera', 'Gastronomía'],
  },
  {
    name: 'Multidisciplinario',
    slug: 'multidisciplinario',
    keywords: ['todas las áreas', 'cualquier área', 'multidisciplinario', 'sin restricción'],
    examples: ['Becas abiertas a cualquier campo', 'Estudios interdisciplinarios'],
  },
];

// Get category by slug
export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}

// Get all category slugs (for validation)
export function getCategorySlugs(): string[] {
  return CATEGORIES.map(c => c.slug);
}

// Get all category names (for display)
export function getCategoryNames(): string[] {
  return CATEGORIES.map(c => c.name);
}

// Type export
export type CategorySlug = typeof CATEGORIES[number]['slug'];
