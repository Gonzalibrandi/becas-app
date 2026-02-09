import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { CATEGORIES } from '@/lib/utils/categories';

export const maxDuration = 60; // Allow 60 seconds for scraping (Vercel limit)

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: Clean text
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// Helper: Clean hrefs (e.g. from argentina.gob.ar)
function cleanHref(href: string | undefined): string | null {
  if (!href) return null;
  if (href.startsWith('blank:#')) {
    return href.replace('blank:#', '');
  }
  return href;
}

// Helper: Generate slug (simplified version)
function generateSlug(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 80);
  return `${slug}-${Math.floor(Date.now() / 1000)}`;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`🚀 Scraping URL (Native TS): ${url}`);

    // 1. Fetch HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const html = await response.text();

    // 2. Parse HTML with Cheerio
    const $ = cheerio.load(html);
    
    // Extract main content
    const mainContent = $('main').length ? $('main') : $('body');
    let textContent = cleanText(mainContent.text()).slice(0, 12000); // Limit to 12k chars

    // 3. Extract Links Logic (ported from Python)
    const linksFound: string[] = [];
    let officialUrlDirect: string | null = null;
    let foundationUrl: string | null = null;

    // Priority 1: "Consultar", "Bases", "Apply"
    $('a[href]').each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim().toLowerCase();
      const href = cleanHref($el.attr('href'));

      if (!href || !href.startsWith('http') || href.includes('argentina.gob.ar')) return;

      if (['consultar', 'bases y condiciones', 'apply', 'postular', 'aplicar'].some(kw => text.includes(kw))) {
        officialUrlDirect = href;
        linksFound.push(`[LINK DIRECTO A LA BECA] -> ${href}`);
        return false; // break loop
      }
    });

    // Priority 2: "Sitio web" (Fallback)
    if (!officialUrlDirect) {
      $('li').each((_, el) => {
        const text = $(el).text().toLowerCase();
        if (text.includes('sitio web') || text.includes('web oficial')) {
          const $link = $(el).find('a[href]');
          const href = cleanHref($link.attr('href'));
          
          if (href && href.startsWith('http') && !href.includes('argentina.gob.ar')) {
            foundationUrl = href;
            linksFound.push(`[SITIO WEB FUNDACION] -> ${href}`);
            return false; // break loop
          }
        }
      });
    }

    // Append links to text context
    if (linksFound.length > 0) {
      textContent += `\n\n=== ENLACES EXTERNOS ENCONTRADOS ===\n${linksFound.join('\n')}`;
    }

    // 4. Call OpenAI
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Build category list for the prompt
    const categoryList = CATEGORIES.map(cat => 
      `  - "${cat.slug}": ${cat.name} (ej: ${cat.examples.slice(0, 2).join(', ')})`
    ).join('\n');

    const prompt = `
Eres un extractor de datos experto para becas educativas. Tu objetivo es analizar el texto de una convocatoria y generar un JSON VÁLIDO que cumpla EXACTAMENTE con el esquema especificado.

URL de Origen: {source_url}

=== CAMPOS OBLIGATORIOS (siempre deben tener valor) ===

1. "title" (string, max 255 chars): 
   - Nombre oficial de la beca
   - Ejemplo: "Beca Chevening para Jóvenes Líderes"

2. "description" (string): 
   - Resumen atractivo de 2-3 oraciones máximo
   - Redactado para motivar al lector a aplicar

3. "country" (string, max 100 chars): 
   - Nombre COMPLETO del país destino EN ESPAÑOL
   - Ejemplos válidos: "Argentina", "Reino Unido", "Estados Unidos", "Alemania", "Francia"
   - Si aplica a varios países: "Internacional"
   - NUNCA uses códigos ISO como "AR" o "UK"

=== CAMPOS DE FECHA (formato estricto o null) ===

4. "deadline" (string o null): 
   - Fecha límite de inscripción en formato EXACTO: "YYYY-MM-DD"
   - Si el texto dice "marzo 2026" usa "2026-03-31"
   - Si no hay año, asume el próximo año lógico
   - Si NO hay fecha límite clara: null

5. "start_date" (string o null): 
   - Fecha de inicio de la beca/cursada en formato: "YYYY-MM-DD"
   - Si NO se menciona: null

=== CAMPOS ENUM (valores EXACTOS, case-sensitive) ===

6. "funding_type" (string): 
   SOLO estos valores permitidos:
   - "FULL" = Cobertura total (pasajes + alojamiento + matrícula + estipendio)
   - "PARTIAL" = Cubre solo algunos gastos
   - "ONE_TIME" = Pago único
   - "UNKNOWN" = No está claro (usar si hay duda)

7. "education_level" (string): 
   SOLO estos valores permitidos:
   - "UNDERGRADUATE" = Grado/Licenciatura
   - "MASTER" = Maestría/Posgrado
   - "PHD" = Doctorado
   - "RESEARCH" = Investigación/Postdoc
   - "SHORT_COURSE" = Curso corto/Capacitación
   - "OTHER" = Otro o no especificado

=== CATEGORÍAS (IMPORTANTE - NUEVO CAMPO) ===

8. "category_slugs" (array de strings):
   - Asigna entre 1 y 5 categorías que mejor representen la beca
   - USA SOLO estos slugs exactos:
${categoryList}

   EJEMPLOS DE CLASIFICACIÓN:
   - "Beca para Maestría en IA" → ["tecnologia-informatica", "ingenieria"]
   - "Beca Derecho Internacional y DDHH" → ["derecho", "derechos-humanos"]
   - "Beca abierta a cualquier área" → ["multidisciplinario"]
   - "Beca en Energía Solar y Medio Ambiente" → ["energias-renovables", "medio-ambiente", "ingenieria"]
   - "Formación para profesores de inglés" → ["formacion-docente", "idiomas-traduccion", "educacion"]

=== CAMPOS DE TEXTO LIBRE (string vacío "" si no hay info) ===


9. "benefits" (string): 
    - Lista de beneficios, UNO POR LÍNEA separados por salto de línea (\\n)
   - Ejemplo: "Pasajes aéreos ida y vuelta\\nAlojamiento completo\\nSeguro médico\\nEstipendio mensual de 1500 USD"
   - Cada beneficio en una línea separada, sin viñetas ni guiones
    - Si no hay info: ""

10. "requirements" (string): 
    - Requisitos principales, UNO POR LÍNEA separados por salto de línea (\\n)
    - Ejemplo: "Título universitario\\nNivel de inglés C1\\nMenor de 35 años\\nCarta de motivación"
    - Cada requisito en una línea separada, sin viñetas ni guiones
    - Si no hay info: ""

11. "duracion" (string, max 100 chars): 
    - Duración de la beca
    - Ejemplos: "1 año", "6 meses", "2 semestres", "3-12 meses"
    - Si no hay info: ""

=== CAMPOS URL (string o null) ===

12. "apply_url" (string o null): 
    - URL DIRECTA para aplicar/postularse a la beca
    - Busca enlaces con texto como "Consultar", "Bases y Condiciones", "Apply", "Postularse"
    - Ejemplo: "https://www.chevening.org/scholarships/"
    - Si no encuentras un link directo de aplicación: null

13. "official_url" (string o null): 
    - URL de la web de la ORGANIZACIÓN/FUNDACIÓN/EMBAJADA que otorga la beca
    - Busca enlaces con texto como "Sitio web", "Web oficial"
    - Ejemplo: "https://www.gov.uk/world/organisations/british-embassy"
    - NO incluir URLs de sitios gubernamentales de origen (ej: argentina.gob.ar)
    - Si no encuentras: null

=== REGLAS IMPORTANTES ===
- Responde SOLO con JSON válido, sin texto adicional
- Usa null para campos de fecha/URL cuando no hay información
- Usa "" (string vacío) para campos de texto libre cuando no hay información
- Los valores de funding_type y education_level deben ser EXACTAMENTE como se especifican (MAYÚSCULAS)
- Para category_slugs, usa SOLO los slugs listados arriba (minúsculas con guiones)
- No inventes información que no esté en el texto

=== TEXTO A ANALIZAR ===
${textContent}
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a JSON extractor. Output ONLY valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const data = JSON.parse(aiResponse.choices[0].message.content || '{}');

    // Validate and filter category_slugs to ensure they match our predefined categories
    const validCategorySlugs = CATEGORIES.map(c => c.slug);
    if (data.category_slugs && Array.isArray(data.category_slugs)) {
      data.category_slugs = data.category_slugs.filter(
        (slug: string) => validCategorySlugs.includes(slug)
      );
      // Default to multidisciplinario if no valid categories
      if (data.category_slugs.length === 0) {
        data.category_slugs = ['multidisciplinario'];
      }
    } else {
      data.category_slugs = ['multidisciplinario'];
    }

    // Fallback URL logic
    if (!data.apply_url && officialUrlDirect) data.apply_url = officialUrlDirect;
    if (!data.official_url && foundationUrl) data.official_url = foundationUrl;

    // Status logic
    const today = new Date().toISOString().split('T')[0];
    if (data.deadline && data.deadline < today) {
      data.status = 'ARCHIVED';
    } else {
      data.status = 'DRAFT';
    }

    // Add infra fields
    data.source_url = url;
    data.slug = generateSlug(data.title || 'beca-sin-titulo');
    data.raw_data = JSON.stringify({ ai_extracted: true, method: 'native-ts' });

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Scraper API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Scraping failed' },
      { status: 500 }
    );
  }
}
