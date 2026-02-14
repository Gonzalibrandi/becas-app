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
    // Revalidation every hour (3600s)
    const res = await fetch(GOOGLE_SHEETS_URL, { next: { revalidate: 3600 } });
    
    if (!res.ok) throw new Error("Failed to fetch sheet");
    
    const json = await res.json();
    let rows = json.values || [];

    // Optional: Limit rows for testing
    if (limit) {
      rows = rows.slice(0, limit + 2);
    }
    
    const scholarships: SheetScholarship[] = [];
    
    // Use a set to deduplicate (O(1) vs O(N^2))
    const seenUrls = new Set<string>();

    rows.forEach((row: string[], index: number) => {
      // 1. Basic validations (Skip headers and broken rows)
      if (index < 2) return; 
      if (!row || row.length < 7) return; 
      
      const title = row[4];
      const rawUrl = row[6];
      
      // 2. Strict filter for empty values
      if (!title || !rawUrl || rawUrl.trim() === "") return;
      
      // 3. Normalization (Key for deduplication)
      const cleanUrl = rawUrl.trim();
      const normalizationKey = cleanUrl.toLowerCase();

      // 4. Deduplication check
      if (seenUrls.has(normalizationKey)) {
        return; // Already exists, ignore it
      }
      
      // 5. Save 
      seenUrls.add(normalizationKey);
      
      scholarships.push({
        areaOriginal: row[0] || "",
        country: row[2] || "",
        countriesList: row[3] || "",
        title: title,
        duration: row[5] || "",
        detailUrl: cleanUrl, // Save the original URL
        rowIndex: index
      });
    });
    
    console.log(`✅ Total Extraction: ${scholarships.length} unique scholarships found.`);
    return scholarships;

  } catch (error) {
    console.error("Sheet Fetch Error:", error);
    return [];
  }
}