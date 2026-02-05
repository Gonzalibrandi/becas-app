import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

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

    const prompt = `
Eres un extractor de datos experto para becas educativas. Tu objetivo es analizar el texto de una convocatoria y generar un JSON VALIDO que cumpla EXACTAMENTE con el esquema especificado.

URL de Origen: ${url}

=== CAMPOS OBLIGATORIOS ===
1. "title" (string): Nombre oficial de la beca.
2. "description" (string): Resumen atractivo de 2-3 oraciones.
3. "country" (string): Nombre COMPLETO del pais destino EN ESPAÑOL (ej: "Reino Unido", "Internacional").

=== CAMPOS DE FECHA (YYYY-MM-DD o null) ===
4. "deadline" (string|null): Fecha limite.
5. "start_date" (string|null): Fecha inicio cursada.

=== CAMPOS ENUM ===
6. "funding_type": "FULL", "PARTIAL", "ONE_TIME", "UNKNOWN"
7. "education_level": "UNDERGRADUATE", "MASTER", "PHD", "RESEARCH", "SHORT_COURSE", "OTHER"

=== TEXTO LIBRE ("" si no hay info) ===
8. "areas": Areas de estudio, una por linea (\\n).
9. "benefits": Beneficios, uno por linea (\\n).
10. "requirements": Requisitos, uno por linea (\\n).
11. "duracion": Duracion (ej: "1 año").

=== URLs (string|null) ===
12. "apply_url": URL directa para aplicar.
13. "official_url": URL de la organización.

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
