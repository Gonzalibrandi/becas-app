import os
import requests
import json
import re
import unicodedata
import time
from bs4 import BeautifulSoup
from openai import OpenAI
import dotenv
from datetime import datetime

dotenv.load_dotenv()

# --- CONFIGURACIÓN ---
API_URL = "http://127.0.0.1:3000/api/scholarships"
# Lee la key del archivo .env
OPENAI_API_KEY = os.getenv("OPEN_AI_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

def clean_text(text):
    """Limpia espacios extra y saltos de línea basura"""
    return re.sub(r'\s+', ' ', text).strip()

def generate_slug(text):
    """Genera un slug único con timestamp para evitar colisiones en pruebas"""
    text = str(text).lower()
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text).strip()
    slug = re.sub(r'[-\s]+', '-', text)
    # Agregamos timestamp corto para unicidad
    return f"{slug}-{int(time.time())}"

def extract_scholarship_data(html_content, source_url):
    print("🤖 Consultando a la IA...")
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # TRUCO PRO: En la web de Argentina.gob.ar, el contenido útil suele estar en <main> o <div class="panels-row">
    # Intentamos reducir el ruido tomando solo el main si existe.
    main_content = soup.find('main') or soup.find('body')
    
    # NUEVO: Extraemos las URLs de los enlaces para que la IA pueda verlas
    body = soup.find('body')
    links_found = []
    official_url_direct = None  # URL de la beca directa (ej: chevening.org)
    foundation_url = None       # URL de la fundación/embajada como fallback
    
    # Helper para limpiar hrefs raros de argentina.gob.ar (ej: "blank:#https://..." -> "https://...")
    def clean_href(href):
        if href.startswith('blank:#'):
            return href.replace('blank:#', '')
        return href
    
    # PRIORIDAD 1: Buscar "Consultar" o "Bases y Condiciones" (link directo a la beca)
    for a_tag in soup.find_all('a', href=True):
        text = a_tag.get_text(strip=True).lower()
        href = clean_href(a_tag['href'])
        if ('consultar' in text or 'bases y condiciones' in text or 'apply' in text or 'postular' in text):
            if href.startswith('http') and 'argentina.gob.ar' not in href:
                official_url_direct = href
                print(f"🎯 DEBUG - PRIORIDAD 1 - Encontrado 'Consultar/Bases': {href}")
                links_found.append(f"[LINK DIRECTO A LA BECA] -> {href}")
                break  # Encontramos el mejor, salimos
    
    # PRIORIDAD 2 (FALLBACK): Buscar "Sitio web" (fundación/embajada)
    if not official_url_direct:
        for li in soup.find_all('li'):
            li_text = li.get_text().lower()
            if 'sitio web' in li_text or 'web oficial' in li_text:
                link = li.find('a', href=True)
                if link:
                    href = clean_href(link['href'])
                    if href.startswith('http') and 'argentina.gob.ar' not in href:
                        foundation_url = href
                        print(f"📎 DEBUG - PRIORIDAD 2 - Encontrado 'Sitio web' (fallback): {href}")
                        links_found.append(f"[SITIO WEB FUNDACIÓN/EMBAJADA] -> {href}")
                        break
    
    # MÉTODO 3: Buscar todos los enlaces externos adicionales (para dar más contexto a la IA)
    all_links = body.find_all('a', href=True) if body else []
    for link in all_links:
        href = clean_href(link['href'])
        text = link.get_text(strip=True)
        # Filtramos solo URLs externas que no hayamos encontrado ya
        if href.startswith('http') and 'argentina.gob.ar' not in href:
            if href != official_url_direct and href != foundation_url:
                links_found.append(f"[ENLACE: {text}] -> {href}")
    
    # DEBUG: Ver qué enlaces encontramos
    print(f"🔗 DEBUG - Enlaces útiles encontrados: {len(links_found)}")
    for l in links_found[:5]:  # Solo los primeros 5 para no llenar la consola
        print(f"   {l}")
    
    # Combinamos el texto + los enlaces encontrados
    text_content = clean_text(main_content.get_text())[:12000]
    
    if links_found:
        links_section = "\n\n=== ENLACES EXTERNOS ENCONTRADOS EN LA PÁGINA ===\n" + "\n".join(links_found)
        text_content = text_content + links_section

    # --- EL PROMPT DE INGENIERÍA ---
    # Prompt optimizado para que el JSON coincida EXACTAMENTE con el modelo Django
    prompt = f"""
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

=== CAMPOS DE TEXTO LIBRE (string vacío "" si no hay info) ===

8. "areas" (string, max 500 chars): 
   - Áreas de estudio, UNA POR LÍNEA separadas por salto de línea (\\n)
   - Ejemplo: "Ingeniería\\nCiencias Sociales\\nArte\\nMedicina"
   - Si aplica a todas: "Todas las áreas"
   - Cada área en una línea separada, sin viñetas ni guiones
   - Si no hay info: ""

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
- No inventes información que no esté en el texto

=== TEXTO A ANALIZAR ===
{text_content}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Usamos el modelo rápido y barato
            messages=[
                {"role": "system", "content": "You are a JSON extractor. Output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1 # Baja temperatura para ser precisos, no creativos
        )
        
        data = json.loads(response.choices[0].message.content)
        
        # DEBUG: Ver qué devolvió la IA para las URLs
        print(f"\n📋 DEBUG - AI Response:")
        print(f"   apply_url: {data.get('apply_url')}")
        print(f"   official_url: {data.get('official_url')}")
        
        # FALLBACK: Si la IA no encontró las URLs pero nosotros sí las extrajimos del HTML
        if not data.get('apply_url') and official_url_direct:
            data['apply_url'] = official_url_direct
            print(f"   ✅ Usando apply_url del HTML: {official_url_direct}")
        if not data.get('official_url') and foundation_url:
            data['official_url'] = foundation_url
            print(f"   ✅ Usando official_url del HTML: {foundation_url}")

        # --- LÓGICA DE ESTADO INICIAL (El Deadline Manda) ---
        today = datetime.now().strftime("%Y-%m-%d")
        deadline = data.get('deadline')
        
        # Estado por defecto
        target_status = 'DRAFT' 

        if deadline:
            if deadline < today:
                # Si la fecha ya pasó, nace Archivada (Cerrada)
                target_status = 'ARCHIVED'
            else:
                # Si la fecha es futura, nace en Borrador (Abierta pero requiere revisión)
                # O poné 'PUBLISHED' si querés que salga en vivo directo.
                target_status = 'DRAFT' 
        else:
             # Si no hay deadline, ante la duda, Borrador.
             target_status = 'DRAFT'

        data['status'] = target_status
        
        # IMPORTANTE: NO enviamos 'is_active' en el JSON. 
        # El backend lo calculará solo cuando alguien consulte la beca.

        # Agregamos campos de infraestructura
        data['source_url'] = source_url
        data['slug'] = generate_slug(data.get('title', 'beca-sin-titulo'))
        data['raw_data'] = {"ai_extracted": True, "original_snippet": text_content[:700]}

        return data

    except Exception as e:
        print(f"❌ Error OpenAI: {e}")
        return None

def run_spider():
    # Las URLs que querés probar
    urls_to_scrape = [
        "https://www.argentina.gob.ar/educacion/campusglobal/becas-extranjero/pollock-krasner-usa",
    ]

    print(f"🕷️  Iniciando Scraper AI para {len(urls_to_scrape)} URLs...")

    for url in urls_to_scrape:
        print(f"\n🔗 Procesando: {url}")
        
        # 1. Descargar HTML
        try:
            res = requests.get(url, timeout=10)
            if res.status_code != 200:
                print(f"❌ Error HTTP {res.status_code}")
                continue
        except Exception as e:
            print(f"❌ Error conexión: {e}")
            continue

        # 2. Extraer con IA
        scholarship_data = extract_scholarship_data(res.text, url)

        if scholarship_data:
            print(f"✨ Título extraído: {scholarship_data.get('title')}")
            print(f"🌍 País: {scholarship_data.get('country')} | Nivel: {scholarship_data.get('education_level')}")
            
            # 3. Enviar a Backend
            try:
                api_res = requests.post(API_URL, json=scholarship_data)
                
                if api_res.status_code in [200, 201]:
                    print("✅ GUARDADA EN BD.")
                else:
                    print(f"⚠️  Rechazada por API:")
                    print(scholarship_data.get('official_url'))
                    print(api_res.text) # Para debuggear errores de validación
            except Exception as e:
                print(f"❌ Error enviando a API: {e}")

if __name__ == "__main__":
    run_spider()