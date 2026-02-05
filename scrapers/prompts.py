"""
Optimized Prompts for Scholarship Extraction
=============================================
High-quality prompts designed to maximize extraction accuracy
and minimize OpenAI API token usage.

Key optimizations:
1. Clear, concise instructions (reduces token count)
2. Structured output format (improves parsing)
3. Field validation hints (reduces post-processing)
4. Context-aware extraction (better accuracy)
"""

from typing import Dict

# System prompt - kept minimal to save tokens
SYSTEM_PROMPT = """You are a precise JSON extractor for scholarship data.
Rules:
- Output ONLY valid JSON, no explanations
- Use null for missing dates/URLs
- Use "" for missing text fields
- Never invent information not in the source"""


def get_extraction_prompt(
    text_content: str,
    source_url: str,
    study_areas: Dict[str, str],
    pre_extracted_data: Dict = None
) -> str:
    """
    Generate the detailed extraction prompt requested by the user.
    """
    
    # Format areas list for the prompt
    areas_list_str = "\n".join([f'   - "{key}": {label}' for key, label in study_areas.items()])
    
    return f"""Eres un extractor de datos experto para becas educativas. Tu objetivo es analizar el texto de una convocatoria y generar un JSON VÁLIDO que cumpla EXACTAMENTE con el esquema especificado.

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
   - Áreas de estudio, UNA POR LÍNEA. Usa SOLO estos códigos exactos:
{areas_list_str}
   - Si aplica a todas: "ALL"
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


def get_bulk_extraction_prompt(
    text_content: str,
    source_url: str,
    known_country: str,
    known_area: str,
    study_areas: Dict[str, str]
) -> str:
    """
    Streamlined prompt for bulk imports where we already know some fields.
    More token-efficient for high-volume processing.
    """
    
    areas_list = ", ".join([f'"{k}"' for k in study_areas.keys()])
    
    return f"""Extrae beca JSON. País: {known_country}. Área sugerida: {known_area}

{{
  "title": "Nombre oficial",
  "description": "2 oraciones máximo",
  "deadline": "YYYY-MM-DD o null",
  "start_date": "YYYY-MM-DD o null", 
  "funding_type": "FULL|PARTIAL|UNKNOWN",
  "education_level": "UNDERGRADUATE|MASTER|PHD|RESEARCH|SHORT_COURSE|OTHER",
  "areas": "{known_area} o ajustar con: [{areas_list}]",
  "benefits": "Lista, uno por línea",
  "requirements": "Lista, uno por línea",
  "duracion": "Ej: 1 año"
}}

TEXTO:
{text_content[:6000]}"""


def get_validation_prompt(extracted_data: Dict) -> str:
    """
    Quick validation prompt to catch obvious errors.
    Only use when accuracy is critical.
    """
    
    return f"""Valida estos datos de beca. Responde con JSON corregido si hay errores evidentes, o exactamente el mismo JSON si está bien.

Errores comunes a revisar:
- País en inglés (UK → Reino Unido, USA → Estados Unidos)
- Fecha inválida
- education_level incorrecto

JSON:
{extracted_data}"""


# Token estimation helpers
def estimate_tokens(text: str) -> int:
    """Rough token estimation (4 chars ≈ 1 token)."""
    return len(text) // 4


def truncate_for_tokens(text: str, max_tokens: int = 2000) -> str:
    """Truncate text to approximately fit token limit."""
    max_chars = max_tokens * 4
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "..."
