"""
Becas Extranjero Nación Scraper
================================
Bulk import scholarships from Argentina.gob.ar Google Sheet,
using the same AI scraper logic as url_scraper.py for each beca.

Usage:
  python becas_extranjero_nacion_scraper.py              # Import all (AI-enriched)
  python becas_extranjero_nacion_scraper.py --limit 10   # Test with 10 first
  python becas_extranjero_nacion_scraper.py --dry-run    # Preview without saving
  python becas_extranjero_nacion_scraper.py --fast       # No AI, just basic import
"""

import argparse
import json
import time
import requests
from typing import Optional, List

from config import (
    generate_slug,
    normalize_area,
    guess_education_level,
    guess_funding_type,
    save_to_api,
)

# Import the url_scraper's scrape_url function for AI extraction
from url_scraper import scrape_url as ai_scrape_url

# === GOOGLE SHEETS CONFIG ===
GOOGLE_SHEETS_URL = (
    "https://sheets.googleapis.com/v4/spreadsheets/"
    "1gI9qV4odLj4bfMUn6EbIdswa5MUJ3rFua-GzRztSQTk/values/Hoja%201"
    "?key=AIzaSyCq2wEEKL9-6RmX-TkW23qJsrmnFHFf5tY&alt=json"
)


def fetch_google_sheet() -> List[list]:
    """Fetch all rows from the Google Sheet."""
    print("📊 Descargando datos de Google Sheets...")
    
    try:
        response = requests.get(GOOGLE_SHEETS_URL, timeout=30)
        response.raise_for_status()
        data = response.json()
        rows = data.get("values", [])
        print(f"✅ {len(rows)} filas descargadas")
        return rows
    except Exception as e:
        print(f"❌ Error: {e}")
        return []


def parse_sheet_row(row: list, index: int) -> Optional[dict]:
    """Parse a single row into basic scholarship data."""
    
    # Skip header rows
    if index < 2:
        return None
    
    if len(row) < 7:
        return None
    
    area = row[0] if len(row) > 0 else ""
    country = row[2] if len(row) > 2 else ""
    countries_list = row[3] if len(row) > 3 else ""
    title = row[4] if len(row) > 4 else ""
    duration = row[5] if len(row) > 5 else ""
    detail_url = row[6] if len(row) > 6 else ""
    
    if not title or not detail_url:
        return None
    
    return {
        "title": title,
        "country": country,
        "countries_list": countries_list,
        "area_original": area,
        "duration": duration,
        "detail_url": detail_url,
        "row_index": index,
    }


def create_basic_scholarship(parsed: dict) -> dict:
    """Create scholarship without AI enrichment (fast mode)."""
    return {
        "title": parsed["title"],
        "slug": generate_slug(parsed["title"]),
        "description": f"Beca disponible en {parsed['country']}. Duración: {parsed['duration']}.",
        "source_url": parsed["detail_url"],
        "apply_url": parsed["detail_url"],
        "official_url": None,
        "country": parsed["country"],
        "deadline": None,
        "start_date": None,
        "funding_type": guess_funding_type(parsed["title"]),
        "education_level": guess_education_level(parsed["title"]),
        "areas": normalize_area(parsed["area_original"]),
        "benefits": "",
        "requirements": "",
        "duracion": parsed["duration"],
        "status": "DRAFT",
        "admin_notes": f"Importado de argentina.gob.ar. Países: {parsed['countries_list']}" if parsed['countries_list'] else "Importado de argentina.gob.ar",
        "raw_data": json.dumps({"source": "google_sheets", "row": parsed["row_index"]}),
    }


def enrich_with_ai(parsed: dict) -> Optional[dict]:
    """Use url_scraper's AI logic to extract full scholarship data."""
    
    url = parsed["detail_url"]
    
    # Use the SAME function as url_scraper.py
    result = ai_scrape_url(url)
    
    if not result.get("success"):
        return None
    
    data = result["data"]
    
    # Override country with the one from the spreadsheet (more reliable)
    if parsed.get("country"):
        data["country"] = parsed["country"]
    
    # Add extra context from spreadsheet
    data["admin_notes"] = f"AI-enriched from spreadsheet. Países: {parsed['countries_list']}"
    data["raw_data"] = json.dumps({
        "source": "ai_enriched",
        "original_row": parsed["row_index"],
        "spreadsheet_area": parsed["area_original"],
    })
    
    # Merge areas if AI didn't find any
    if not data.get("areas") or data.get("areas") == "":
        data["areas"] = normalize_area(parsed["area_original"])
    
    # Use spreadsheet duration if AI didn't find it
    if not data.get("duracion") and parsed.get("duration"):
        data["duracion"] = parsed["duration"]
    
    return data


def main():
    parser = argparse.ArgumentParser(description="Import scholarships from Argentina.gob.ar")
    parser.add_argument("--limit", type=int, help="Limit number to process")
    parser.add_argument("--dry-run", action="store_true", help="Don't save, just preview")
    parser.add_argument("--fast", action="store_true", help="Skip AI enrichment (faster)")
    parser.add_argument("--start", type=int, default=0, help="Start from row N")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🎓 BECAS EXTRANJERO NACIÓN - IMPORTADOR")
    print("=" * 60)
    
    # Fetch data
    rows = fetch_google_sheet()
    if not rows:
        return
    
    # Parse all rows
    parsed_items = []
    for i, row in enumerate(rows):
        parsed = parse_sheet_row(row, i)
        if parsed:
            parsed_items.append(parsed)
    
    print(f"📚 {len(parsed_items)} becas parseadas")
    
    # Apply filters
    if args.start:
        parsed_items = parsed_items[args.start:]
        print(f"   (Empezando desde {args.start})")
    
    if args.limit:
        parsed_items = parsed_items[:args.limit]
        print(f"   (Limitado a {args.limit})")
    
    if args.dry_run:
        print("\n🔍 DRY RUN - Primeras 5 becas:")
        for i, p in enumerate(parsed_items[:5]):
            print(f"   {i+1}. {p['title'][:50]}... ({p['country']}) - {p['area_original'][:20]}")
        return
    
    # Process
    print(f"\n💾 Procesando {len(parsed_items)} becas...")
    mode = "FAST (sin IA)" if args.fast else "AI-ENRICHED (usando url_scraper)"
    print(f"   Modo: {mode}")
    
    success = 0
    errors = 0
    session = requests.Session()
    
    for i, parsed in enumerate(parsed_items):
        print(f"\n[{i+1}/{len(parsed_items)}] {parsed['title'][:45]}...", end=" ")
        
        if args.fast:
            # Fast mode: basic import
            scholarship = create_basic_scholarship(parsed)
        else:
            # AI mode: use url_scraper logic
            print("🤖", end=" ")
            scholarship = enrich_with_ai(parsed)
            
            if not scholarship:
                print("⚠️  Fallback to basic")
                scholarship = create_basic_scholarship(parsed)
        
        # Save
        if save_to_api(scholarship, session):
            print("✅")
            success += 1
        else:
            print("❌")
            errors += 1
        
        # Rate limiting for AI mode (respect OpenAI limits)
        if not args.fast:
            time.sleep(1)  # 1 second between each AI call
    
    print("\n" + "=" * 60)
    print(f"✅ IMPORTACIÓN COMPLETA")
    print(f"   Exitosas: {success}")
    print(f"   Errores: {errors}")
    print("=" * 60)


if __name__ == "__main__":
    main()
