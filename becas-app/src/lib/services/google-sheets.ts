// utils/googleSheets.ts

export interface SheetScholarship {
  areaOriginal: string;
  country: string;
  countriesList: string;
  title: string;
  duration: string;
  detailUrl: string; // source_url
  rowIndex: number;
}

const GOOGLE_SHEETS_URL = 
  "https://sheets.googleapis.com/v4/spreadsheets/1gI9qV4odLj4bfMUn6EbIdswa5MUJ3rFua-GzRztSQTk/values/Hoja%201?key=AIzaSyCq2wEEKL9-6RmX-TkW23qJsrmnFHFf5tY&alt=json";

export async function fetchGoogleSheetData(limit?: number): Promise<SheetScholarship[]> {
  try {
    // Revalidación cada hora (3600s)
    const res = await fetch(GOOGLE_SHEETS_URL, { next: { revalidate: 3600 } });
    
    if (!res.ok) throw new Error("Failed to fetch sheet");
    
    const json = await res.json();
    let rows = json.values || [];

    // Optional: Limit rows for testing
    if (limit) {
      rows = rows.slice(0, limit + 2);
    }
    
    const scholarships: SheetScholarship[] = [];
    
    // 🔥 USAMOS UN SET PARA DEDUPLICAR (O(1) vs O(N^2))
    const seenUrls = new Set<string>();

    rows.forEach((row: string[], index: number) => {
      // 1. Validaciones básicas (Saltar headers y filas rotas)
      if (index < 2) return; 
      if (!row || row.length < 7) return; 
      
      const title = row[4];
      const rawUrl = row[6];
      
      // 2. Filtro estricto de vacíos
      if (!title || !rawUrl || rawUrl.trim() === "") return;
      
      // 3. Normalización (Clave para deduplicar)
      const cleanUrl = rawUrl.trim();
      const normalizationKey = cleanUrl.toLowerCase();

      // 4. Chequeo de duplicados
      if (seenUrls.has(normalizationKey)) {
        return; // Ya existe, la ignoramos
      }
      
      // 5. Guardamos
      seenUrls.add(normalizationKey);
      
      scholarships.push({
        areaOriginal: row[0] || "",
        country: row[2] || "",
        countriesList: row[3] || "",
        title: title,
        duration: row[5] || "",
        detailUrl: cleanUrl, // Guardamos la URL original bonita
        rowIndex: index
      });
    });
    
    console.log(`✅ Extracción Total: ${scholarships.length} becas únicas encontradas.`);
    return scholarships;

  } catch (error) {
    console.error("Sheet Fetch Error:", error);
    return [];
  }
}