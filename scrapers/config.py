"""
Shared constants and utilities for all scrapers.
This ensures consistency between Python scrapers and the Next.js frontend.
"""

import os
import re
import time
import unicodedata
import requests
from typing import List, Dict, Optional
from openai import OpenAI
import dotenv

dotenv.load_dotenv()

# === CONFIGURATION ===
OPENAI_API_KEY = os.getenv("OPEN_AI_KEY")

# API endpoints
API_URL_LOCAL = "http://127.0.0.1:3000/api/scholarships"
API_URL_PROD = "https://becas-app.vercel.app/api/scholarships"

# Use environment to determine which API to use
API_URL = os.getenv("API_URL", API_URL_LOCAL)

# Client for OpenAI
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# === STUDY AREAS (must match frontend constants.ts) ===
# Keys are what we store in DB, values are display labels
STUDY_AREAS = {
    "ENGINEERING": "Ingeniería y Tecnología",
    "MEDICINE": "Medicina y Salud", 
    "LAW": "Derecho",
    "ARTS": "Artes y Humanidades",
    "SCIENCES": "Ciencias Exactas",
    "SOCIAL": "Ciencias Sociales",
    "BUSINESS": "Negocios y Economía",
    "EDUCATION": "Educación",
    "AGRICULTURE": "Agricultura y Medio Ambiente",
    "LANGUAGES": "Idiomas",
    "ARCHITECTURE": "Arquitectura",
    "TECHNOLOGY": "Informática y Computación",
    "ALL": "Todas las áreas",
}

# Mapping from Google Sheets area names to our normalized keys
AREA_MAPPING: Dict[str, str] = {
    # Google Sheets originals -> our DB keys
    "Agricultura, medioambiente y afines": "AGRICULTURE",
    "Arquitectura, construcción y planeamiento": "ARCHITECTURE",
    "Ciencias puras y aplicadas": "SCIENCES",
    "Ciencias sociales y comunicación": "SOCIAL",
    "Computación, Matemáticas y Ciencias de la Información": "TECHNOLOGY",
    "Derecho y afines": "LAW",
    "Economía, negocios y administración": "BUSINESS",
    "Educación y formación docente": "EDUCATION",
    "Humanidades": "ARTS",
    "Idiomas": "LANGUAGES",
    "Ingeniería y tecnología": "ENGINEERING",
    "Arte y cultura": "ARTS",
    "Medicina y ciencias de la salud": "MEDICINE",
    "Todas las disciplinas": "ALL",
    # Common variations
    "Medio Ambiente": "AGRICULTURE",
    "Tecnología": "TECHNOLOGY",
    "Informática": "TECHNOLOGY",
    "Salud": "MEDICINE",
    "Economía": "BUSINESS",
    "Artes": "ARTS",
    "Ciencias": "SCIENCES",
}


def normalize_area(area_text: str) -> str:
    """
    Normalize an area string to our DB key format.
    Returns the key (e.g., 'ENGINEERING') or 'ALL' if not found.
    """
    if not area_text:
        return "ALL"
    
    area_clean = area_text.strip()
    
    # Direct match in mapping
    if area_clean in AREA_MAPPING:
        return AREA_MAPPING[area_clean]
    
    # Case-insensitive search
    for original, key in AREA_MAPPING.items():
        if original.lower() == area_clean.lower():
            return key
    
    # Partial match
    area_lower = area_clean.lower()
    for original, key in AREA_MAPPING.items():
        if original.lower() in area_lower or area_lower in original.lower():
            return key
    
    return "ALL"


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


def guess_education_level(text: str) -> str:
    """Guess education level from text content."""
    text_lower = text.lower()
    
    if any(x in text_lower for x in ["doctorado", "phd", "doctoral"]):
        return "PHD"
    elif any(x in text_lower for x in ["maestría", "master", "posgrado", "postgrado", "máster"]):
        return "MASTER"
    elif any(x in text_lower for x in ["grado", "undergraduate", "licenciatura", "pregrado"]):
        return "UNDERGRADUATE"
    elif any(x in text_lower for x in ["investigación", "research", "postdoc"]):
        return "RESEARCH"
    elif any(x in text_lower for x in ["curso", "course", "capacitación", "idioma", "seminario"]):
        return "SHORT_COURSE"
    else:
        return "OTHER"


def guess_funding_type(text: str) -> str:
    """Guess funding type from text content."""
    text_lower = text.lower()
    
    if any(x in text_lower for x in ["completa", "full", "total", "100%", "beca completa"]):
        return "FULL"
    elif any(x in text_lower for x in ["parcial", "partial"]):
        return "PARTIAL"
    else:
        return "UNKNOWN"


def save_to_api(scholarship_data: dict, session: Optional[requests.Session] = None) -> bool:
    """Save scholarship to API, handling auth and errors."""
    if session is None:
        session = requests.Session()
    
    try:
        response = session.post(API_URL, json=scholarship_data, timeout=15)
        
        if response.status_code in [200, 201]:
            return True
        elif response.status_code == 401:
            print("❌ Error 401: API requiere autenticación")
            return False
        elif response.status_code == 409:
            print(f"⚠️  Duplicado: {scholarship_data.get('title', '')[:50]}")
            return False
        else:
            print(f"❌ Error {response.status_code}: {response.text[:100]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ No se pudo conectar a {API_URL}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
