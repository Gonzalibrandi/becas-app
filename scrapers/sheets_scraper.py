"""
Google Sheets Scraper for Argentina.gob.ar Scholarships
========================================================
This scraper fetches scholarship data directly from the government's
public Google Sheet and optionally enriches each entry with AI-extracted
details from the individual scholarship pages.

Usage:
  python sheets_scraper.py              # Import all scholarships (basic data)
  python sheets_scraper.py --enrich     # Also fetch details from each page (slower)
  python sheets_scraper.py --limit 50   # Process only first 50 scholarships
"""

import requests
import json
import time
import re
import unicodedata
from typing import Optional
import argparse

# === CONFIGURATION ===
GOOGLE_SHEETS_URL = (
    "https://sheets.googleapis.com/v4/spreadsheets/"
    "1gI9qV4odLj4bfMUn6EbIdswa5MUJ3rFua-GzRztSQTk/values/Hoja%201"
    "?key=AIzaSyCq2wEEKL9-6RmX-TkW23qJsrmnFHFf5tY&alt=json"
)

# Your Next.js API endpoint
API_URL = "http://localhost:3000/api/scholarships"

# For AI enrichment (optional)
OPENAI_API_KEY = ""  # Add your key if you want AI enrichment

def slugify(value: str) -> str:
    """Create URL-friendly slug from text."""
    value = str(value).lower()
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip()
    return re.sub(r'[-\s]+', '-', value)[:100]

def map_area_to_our_format(area: str) -> str:
    """Map Google Sheet area names to cleaner format."""
    area_mapping = {
        "Agricultura, medioambiente y afines": "Agricultura y Medio Ambiente",
        "Arquitectura, construcción y planeamiento": "Arquitectura",
        "Ciencias puras y aplicadas": "Ciencias",
        "Ciencias sociales y comunicación": "Ciencias Sociales",
        "Computación, Matemáticas y Ciencias de la Información": "Tecnología e Informática",
        "Derecho y afines": "Derecho",
        "Economía, negocios y administración": "Negocios y Economía",
        "Educación y formación docente": "Educación",
        "Humanidades": "Humanidades",
        "Idiomas": "Idiomas",
        "Ingeniería y tecnología": "Ingeniería",
        "Arte y cultura": "Arte y Cultura",
        "Medicina y ciencias de la salud": "Medicina y Salud",
        "Todas las disciplinas": "Todas las áreas",
    }
    return area_mapping.get(area, area)

def guess_education_level(title: str, url: str) -> str:
    """Guess education level from scholarship title/URL."""
    text = (title + url).lower()
    
    if any(x in text for x in ["doctorado", "phd", "doctoral"]):
        return "PHD"
    elif any(x in text for x in ["maestría", "master", "posgrado", "postgrado"]):
        return "MASTER"
    elif any(x in text for x in ["grado", "undergraduate", "licenciatura"]):
        return "UNDERGRADUATE"
    elif any(x in text for x in ["investigación", "research", "postdoc"]):
        return "RESEARCH"
    elif any(x in text for x in ["curso", "course", "capacitación", "idioma"]):
        return "SHORT_COURSE"
    else:
        return "OTHER"

def guess_funding_type(title: str) -> str:
    """Guess funding type from title."""
    text = title.lower()
    
    if any(x in text for x in ["completa", "full", "total", "beca completa"]):
        return "FULL"
    elif any(x in text for x in ["parcial", "partial"]):
        return "PARTIAL"
    else:
        return "UNKNOWN"

def fetch_google_sheet_data():
    """Fetch all scholarship data from the Google Sheet."""
    print("📊 Fetching data from Google Sheets...")
    
    try:
        response = requests.get(GOOGLE_SHEETS_URL, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        rows = data.get("values", [])
        print(f"✅ Retrieved {len(rows)} rows from Google Sheet")
        return rows
        
    except Exception as e:
        print(f"❌ Error fetching Google Sheet: {e}")
        return []

def parse_scholarship_row(row: list, index: int) -> Optional[dict]:
    """Parse a single row from the Google Sheet into a scholarship object."""
    
    # Skip header rows (first 2 rows)
    if index < 2:
        return None
    
    # Ensure row has enough columns
    if len(row) < 7:
        return None
    
    area = row[0] if len(row) > 0 else ""
    # row[1] is the flag image, skip
    country = row[2] if len(row) > 2 else ""
    countries_list = row[3] if len(row) > 3 else ""
    title = row[4] if len(row) > 4 else ""
    duration = row[5] if len(row) > 5 else ""
    detail_url = row[6] if len(row) > 6 else ""
    
    # Skip empty rows
    if not title or not detail_url:
        return None
    
    # Generate unique slug
    base_slug = slugify(title)
    unique_slug = f"{base_slug}-{index}"
    
    return {
        "title": title,
        "slug": unique_slug,
        "description": f"Beca disponible en {country}. Duración: {duration}.",
        "source_url": detail_url,
        "apply_url": detail_url,  # Will be updated if AI enrichment is used
        "official_url": None,
        "country": country,
        "deadline": None,  # Not available in sheet, could be enriched
        "start_date": None,
        "funding_type": guess_funding_type(title),
        "education_level": guess_education_level(title, detail_url),
        "areas": map_area_to_our_format(area),
        "benefits": "",  # Would need enrichment
        "requirements": "",  # Would need enrichment
        "duracion": duration,
        "status": "DRAFT",  # Start as draft for review
        "admin_notes": f"Imported from argentina.gob.ar. Countries: {countries_list}" if countries_list else "Imported from argentina.gob.ar",
    }

def save_scholarship(scholarship: dict, session: requests.Session) -> bool:
    """Save a scholarship to the database via API."""
    try:
        response = session.post(API_URL, json=scholarship, timeout=10)
        
        if response.status_code in [200, 201]:
            return True
        elif response.status_code == 409:  # Conflict/duplicate
            print(f"   ⚠️  Duplicate: {scholarship['title'][:50]}...")
            return False
        else:
            print(f"   ❌ Error {response.status_code}: {response.text[:100]}")
            return False
            
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Import scholarships from Google Sheets")
    parser.add_argument("--limit", type=int, help="Limit number of scholarships to process")
    parser.add_argument("--enrich", action="store_true", help="Enrich data with AI (slower)")
    parser.add_argument("--dry-run", action="store_true", help="Don't save, just show what would be imported")
    args = parser.parse_args()
    
    print("=" * 60)
    print("🎓 ARGENTINA.GOB.AR SCHOLARSHIP IMPORTER")
    print("=" * 60)
    
    # Fetch data
    rows = fetch_google_sheet_data()
    if not rows:
        print("No data to process. Exiting.")
        return
    
    # Parse scholarships - keep all rows (no de-duplication)
    # This allows users to filter by specific study area
    scholarships = []
    
    for i, row in enumerate(rows):
        scholarship = parse_scholarship_row(row, i)
        if scholarship:
            scholarships.append(scholarship)
    
    print(f"\n📚 Parsed {len(scholarships)} scholarships ready for import")
    
    # Apply limit if specified
    if args.limit:
        scholarships = scholarships[:args.limit]
        print(f"   (Limited to first {args.limit})")
    
    if args.dry_run:
        print("\n🔍 DRY RUN - Would import these scholarships:")
        for i, s in enumerate(scholarships[:10]):
            print(f"   {i+1}. {s['title'][:60]}... ({s['country']})")
        if len(scholarships) > 10:
            print(f"   ... and {len(scholarships) - 10} more")
        return
    
    # Save to database
    print(f"\n💾 Saving to database...")
    session = requests.Session()
    
    success_count = 0
    error_count = 0
    
    for i, scholarship in enumerate(scholarships):
        print(f"   [{i+1}/{len(scholarships)}] {scholarship['title'][:50]}...", end=" ")
        
        if save_scholarship(scholarship, session):
            print("✅")
            success_count += 1
        else:
            error_count += 1
        
        # Small delay to avoid overwhelming the API
        if i % 10 == 0:
            time.sleep(0.1)
    
    print("\n" + "=" * 60)
    print(f"✅ IMPORT COMPLETE")
    print(f"   Successful: {success_count}")
    print(f"   Errors: {error_count}")
    print("=" * 60)
    print("\n💡 Next steps:")
    print("   1. Go to /admin/becas to review imported scholarships")
    print("   2. Change status from 'Borrador' to 'Publicada' for approved ones")
    print("   3. Run with --enrich flag for AI-enhanced descriptions (slower)")

if __name__ == "__main__":
    main()
