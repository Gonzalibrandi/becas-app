"""
URL Scraper - Single URL AI-powered scholarship extractor
==========================================================
Designed to be called from the frontend admin panel.

Usage:
  python url_scraper.py "https://example.com/scholarship"
  python url_scraper.py "https://example.com/scholarship" --dry-run
  python url_scraper.py "https://example.com/scholarship" --json
"""

import sys
import io
import os
import json
import argparse
import re
import unicodedata
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from openai import OpenAI
import dotenv

dotenv.load_dotenv()

# === CONFIGURATION ===
OPENAI_API_KEY = os.getenv("OPEN_AI_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Global flag for JSON mode (suppress non-JSON output)
_json_mode = False


def log(msg: str) -> None:
    """Print only if not in JSON mode."""
    if not _json_mode:
        print(msg, file=sys.stderr)


def clean_text(text: str) -> str:
    """Remove extra whitespace and clean text."""
    return re.sub(r'\s+', ' ', text).strip()


def generate_slug(text: str) -> str:
    """Generate URL-friendly slug with timestamp for uniqueness."""
    text = str(text).lower()
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text).strip()
    slug = re.sub(r'[-\s]+', '-', text)[:80]
    return f"{slug}-{int(time.time())}"


def clean_href(href: str) -> str:
    """Clean weird hrefs from argentina.gob.ar (e.g., 'blank:#https://...' -> 'https://...')"""
    if href.startswith('blank:#'):
        return href.replace('blank:#', '')
    return href


def extract_scholarship_data(html_content: str, source_url: str) -> dict:
    """Extract scholarship data from HTML using AI."""
    
    log("[*] Parsing HTML and extracting links...")
    
    soup = BeautifulSoup(html_content, 'html.parser')
    main_content = soup.find('main') or soup.find('body')
    
    # === URL EXTRACTION ===
    links_found = []
    official_url_direct = None  # Direct scholarship URL (e.g., chevening.org)
    foundation_url = None       # Foundation/embassy URL as fallback
    
    # PRIORITY 1: Look for "Consultar", "Bases y Condiciones", "Apply"
    for a_tag in soup.find_all('a', href=True):
        text = a_tag.get_text(strip=True).lower()
        href = clean_href(a_tag['href'])
        if any(kw in text for kw in ['consultar', 'bases y condiciones', 'apply', 'postular', 'aplicar']):
            if href.startswith('http') and 'argentina.gob.ar' not in href:
                official_url_direct = href
                log(f"   [+] Found 'Consultar/Bases': {href}")
                links_found.append(f"[LINK DIRECTO A LA BECA] -> {href}")
                break
    
    # PRIORITY 2 (FALLBACK): Look for "Sitio web"
    if not official_url_direct:
        for li in soup.find_all('li'):
            li_text = li.get_text().lower()
            if 'sitio web' in li_text or 'web oficial' in li_text:
                link = li.find('a', href=True)
                if link:
                    href = clean_href(link['href'])
                    if href.startswith('http') and 'argentina.gob.ar' not in href:
                        foundation_url = href
                        log(f"   [+] Found 'Sitio web' (fallback): {href}")
                        links_found.append(f"[SITIO WEB FUNDACION/EMBAJADA] -> {href}")
                        break
    
    # Collect additional external links for context
    body = soup.find('body')
    if body:
        for link in body.find_all('a', href=True):
            href = clean_href(link['href'])
            text = link.get_text(strip=True)
            if href.startswith('http') and 'argentina.gob.ar' not in href:
                if href != official_url_direct and href != foundation_url:
                    links_found.append(f"[ENLACE: {text}] -> {href}")
    
    # Combine text + links
    text_content = clean_text(main_content.get_text())[:12000] if main_content else ""
    
    if links_found:
        links_section = "\n\n=== ENLACES EXTERNOS ENCONTRADOS EN LA PAGINA ===\n" + "\n".join(links_found[:10])
        text_content = text_content + links_section
    
    # === AI EXTRACTION ===
    log("[*] Consulting AI...")
    
    if not client:
        return {"success": False, "error": "OpenAI API key not configured"}
    
    prompt = f"""
Eres un extractor de datos experto para becas educativas. Tu objetivo es analizar el texto de una convocatoria y generar un JSON VALIDO que cumpla EXACTAMENTE con el esquema especificado.

URL de Origen: {source_url}

=== CAMPOS OBLIGATORIOS (siempre deben tener valor) ===

1. "title" (string, max 255 chars): 
   - Nombre oficial de la beca
   - Ejemplo: "Beca Chevening para Jovenes Lideres"

2. "description" (string): 
   - Resumen atractivo de 2-3 oraciones maximo
   - Redactado para motivar al lector a aplicar

3. "country" (string, max 100 chars): 
   - Nombre COMPLETO del pais destino EN ESPANOL
   - Ejemplos validos: "Argentina", "Reino Unido", "Estados Unidos", "Alemania", "Francia"
   - Si aplica a varios paises: "Internacional"
   - NUNCA uses codigos ISO como "AR" o "UK"

=== CAMPOS DE FECHA (formato estricto o null) ===

4. "deadline" (string o null): 
   - Fecha limite de inscripcion en formato EXACTO: "YYYY-MM-DD"
   - Si el texto dice "marzo 2026" usa "2026-03-31"
   - Si no hay anho, asume el proximo anho logico
   - Si NO hay fecha limite clara: null

5. "start_date" (string o null): 
   - Fecha de inicio de la beca/cursada en formato: "YYYY-MM-DD"
   - Si NO se menciona: null

=== CAMPOS ENUM (valores EXACTOS, case-sensitive) ===

6. "funding_type" (string): 
   SOLO estos valores permitidos:
   - "FULL" = Cobertura total (pasajes + alojamiento + matricula + estipendio)
   - "PARTIAL" = Cubre solo algunos gastos
   - "ONE_TIME" = Pago unico
   - "UNKNOWN" = No esta claro (usar si hay duda)

7. "education_level" (string): 
   SOLO estos valores permitidos:
   - "UNDERGRADUATE" = Grado/Licenciatura
   - "MASTER" = Maestria/Posgrado
   - "PHD" = Doctorado
   - "RESEARCH" = Investigacion/Postdoc
   - "SHORT_COURSE" = Curso corto/Capacitacion
   - "OTHER" = Otro o no especificado

=== CAMPOS DE TEXTO LIBRE (string vacio "" si no hay info) ===

8. "areas" (string, max 500 chars): 
   - Areas de estudio, UNA POR LINEA separadas por salto de linea (\\n)
   - Ejemplo: "Ingenieria\\nCiencias Sociales\\nArte\\nMedicina"
   - Si aplica a todas: "Todas las areas"
   - Si no hay info: ""

9. "benefits" (string): 
   - Lista de beneficios, UNO POR LINEA separados por salto de linea (\\n)
   - Ejemplo: "Pasajes aereos ida y vuelta\\nAlojamiento completo\\nSeguro medico\\nEstipendio mensual de 1500 USD"
   - Cada beneficio en una linea separada, sin vinetas ni guiones
   - Si no hay info: ""

10. "requirements" (string): 
    - Requisitos principales, UNO POR LINEA separados por salto de linea (\\n)
    - Ejemplo: "Titulo universitario\\nNivel de ingles C1\\nMenor de 35 anhos\\nCarta de motivacion"
    - Cada requisito en una linea separada, sin vinetas ni guiones
    - Si no hay info: ""

11. "duracion" (string, max 100 chars): 
    - Duracion de la beca
    - Ejemplos: "1 anho", "6 meses", "2 semestres", "3-12 meses"
    - Si no hay info: ""

=== CAMPOS URL (string o null) ===

12. "apply_url" (string o null): 
    - URL DIRECTA para aplicar/postularse a la beca
    - Busca enlaces con texto como "Consultar", "Bases y Condiciones", "Apply", "Postularse"
    - Si no encuentras un link directo de aplicacion: null

13. "official_url" (string o null): 
    - URL de la web de la ORGANIZACION/FUNDACION/EMBAJADA que otorga la beca
    - Busca enlaces con texto como "Sitio web", "Web oficial"
    - NO incluir URLs de sitios gubernamentales de origen (ej: argentina.gob.ar)
    - Si no encuentras: null

=== REGLAS IMPORTANTES ===
- Responde SOLO con JSON valido, sin texto adicional
- Usa null para campos de fecha/URL cuando no hay informacion
- Usa "" (string vacio) para campos de texto libre cuando no hay informacion
- Los valores de funding_type y education_level deben ser EXACTAMENTE como se especifican (MAYUSCULAS)
- No inventes informacion que no este en el texto

=== TEXTO A ANALIZAR ===
{text_content}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a JSON extractor. Output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        data = json.loads(response.choices[0].message.content)
        
        log(f"   [+] AI extracted title: {data.get('title')}")
        
        # FALLBACK: Use our extracted URLs if AI didn't find them
        if not data.get('apply_url') and official_url_direct:
            data['apply_url'] = official_url_direct
            log(f"   [+] Using apply_url from HTML: {official_url_direct}")
        if not data.get('official_url') and foundation_url:
            data['official_url'] = foundation_url
            log(f"   [+] Using official_url from HTML: {foundation_url}")
        
        # === STATUS LOGIC (Deadline decides) ===
        today = datetime.now().strftime("%Y-%m-%d")
        deadline = data.get('deadline')
        
        if deadline and deadline < today:
            data['status'] = 'ARCHIVED'
        else:
            data['status'] = 'DRAFT'
        
        # Add infrastructure fields
        data['source_url'] = source_url
        data['slug'] = generate_slug(data.get('title', 'beca-sin-titulo'))
        data['raw_data'] = json.dumps({"ai_extracted": True, "scraped_at": datetime.now().isoformat()})
        
        return {"success": True, "data": data}
        
    except Exception as e:
        return {"success": False, "error": f"OpenAI Error: {e}"}


def scrape_url(url: str) -> dict:
    """Main entry point: fetch URL and extract data."""
    
    log(f"[*] Fetching: {url}")
    
    try:
        res = requests.get(url, timeout=15, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        if res.status_code != 200:
            return {"success": False, "error": f"HTTP Error {res.status_code}"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": f"Connection error: {e}"}
    
    return extract_scholarship_data(res.text, url)


def main():
    global _json_mode
    
    parser = argparse.ArgumentParser(description="Scrape a single scholarship URL with AI")
    parser.add_argument("url", help="URL to scrape")
    parser.add_argument("--dry-run", action="store_true", help="Just preview, don't output JSON")
    parser.add_argument("--json", action="store_true", help="Output only JSON (for API use)")
    
    args = parser.parse_args()
    
    # Set JSON mode to suppress all non-JSON output
    if args.json:
        _json_mode = True
    
    result = scrape_url(args.url)
    
    if args.json:
        # Clean JSON output only
        print(json.dumps(result, ensure_ascii=False))
    else:
        # Human-readable output
        if result['success']:
            data = result['data']
            print(f"\n[+] Title: {data.get('title')}")
            print(f"[+] Country: {data.get('country')} | Level: {data.get('education_level')}")
            print(f"[+] Areas: {data.get('areas')}")
            print(f"[+] apply_url: {data.get('apply_url')}")
            print(f"[+] official_url: {data.get('official_url')}")
            
            if args.dry_run:
                print("\n[DRY RUN] Full data:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"\n[!] Error: {result.get('error')}")


if __name__ == "__main__":
    main()
