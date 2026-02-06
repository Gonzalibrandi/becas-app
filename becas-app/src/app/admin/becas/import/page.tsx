"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fetchGoogleSheetData, SheetScholarship } from "@/lib/google-sheets";
import { Check, AlertCircle, Loader2, ArrowRight, Save, Database } from "lucide-react";

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SheetScholarship[]>([]);
  const [existingUrls, setExistingUrls] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  
  // Import process state
  const [isImporting, setIsImporting] = useState(false);
  const [currentImportIndex, setCurrentImportIndex] = useState(-1);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Set<string>>(new Set());

  // Auto-load on mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Fetch Data from Sheet
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchGoogleSheetData();
      setItems(data);
      checkDuplicates(data);
    } catch (e) {
      console.error(e);
      alert("Error cargando sheet");
    } finally {
      setLoading(false);
    }
  };

  // 2. Check Duplicates against DB
  const checkDuplicates = async (data: SheetScholarship[]) => {
    try {
      const urls = data.map(d => d.detailUrl);
      const res = await fetch('/api/scholarships/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      const json = await res.json();
      if (json.existingUrls) {
        setExistingUrls(new Set(json.existingUrls));
      }
      setChecked(true);
    } catch (e) {
      console.error("Check failed", e);
    }
  };

  // 3. Import Logic (Queue)
  const startImport = async () => {
    if (isImporting) return;
    setIsImporting(true);
    
    // Filter only new items
    const toImport = items.filter(item => 
      !existingUrls.has(item.detailUrl) && 
      !imported.has(item.detailUrl)
    );

    for (let i = 0; i < toImport.length; i++) {
        const item = toImport[i];
        setCurrentImportIndex(i);
        
        try {
            // A. Scrape (Native TS) - now uses normalizeCountry automatically
            const scrapeRes = await fetch('/api/admin/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: item.detailUrl })
            });

            if (!scrapeRes.ok) throw new Error("Scrape failed");
            const scrapedData = await scrapeRes.json();

            // Enrich with sheet data if missing
            if (!scrapedData.title) scrapedData.title = item.title;
            // Force country from sheet if available (usually cleaner) or trust scraper (normalized)
            // Let's rely on scraper + normalization, but if empty, use sheet
            if (!scrapedData.country) scrapedData.country = item.country;
            
            // B. Save to DB
            const saveRes = await fetch('/api/scholarships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scrapedData)
            });

            if (!saveRes.ok) throw new Error("Save failed");
            
            setImported(prev => new Set(prev).add(item.detailUrl));

        } catch (e) {
            console.error(`Failed to import ${item.title}`, e);
            setFailed(prev => new Set(prev).add(item.detailUrl));
        }

        // Small delay to be nice
        await new Promise(r => setTimeout(r, 500));
    }

    setIsImporting(false);
    setCurrentImportIndex(-1);
    alert("Importación completada");
  };

  const newCount = items.filter(i => !existingUrls.has(i.detailUrl)).length;
  const existsCount = items.length - newCount;

  return (
    <AdminLayout>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Importar Becas</h1>
                    <p className="text-slate-600">Desde Google Sheets Oficial</p>
                </div>
                <div className="flex gap-2">
                    {/* Auto-loaded, button removed */}
                    
                    {checked && newCount > 0 && (
                        <Button onClick={startImport} disabled={isImporting} className="bg-emerald-600 hover:bg-emerald-700">
                            {isImporting ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2"/>}
                            {isImporting ? `Procesando (${currentImportIndex + 1}/${newCount - imported.size})` : `Procesar ${newCount - imported.size} Nuevas`}
                        </Button>
                    )}
                </div>
            </div>

            {items.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                    <Card className="text-center p-4">
                        <div className="text-2xl font-bold">{items.length}</div>
                        <div className="text-xs text-slate-500 uppercase">Total Filas</div>
                    </Card>
                    <Card className="text-center p-4 bg-emerald-50 border-emerald-100">
                        <div className="text-2xl font-bold text-emerald-700">{newCount}</div>
                        <div className="text-xs text-emerald-600 uppercase">Nuevas</div>
                    </Card>
                    <Card className="text-center p-4 bg-amber-50 border-amber-100">
                        <div className="text-2xl font-bold text-amber-700">{existsCount}</div>
                        <div className="text-xs text-amber-600 uppercase">Ya Existen</div>
                    </Card>
                    <Card className="text-center p-4 bg-blue-50 border-blue-100">
                        <div className="text-2xl font-bold text-blue-700">{imported.size}</div>
                        <div className="text-xs text-blue-600 uppercase">Importadas Hoy</div>
                    </Card>
                </div>
            )}

            {items.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr className="text-left text-slate-500 border-b">
                                    <th className="p-3">Estado</th>
                                    <th className="p-3">Título</th>
                                    <th className="p-3">País</th>
                                    <th className="p-3">Origen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => {
                                    const exists = existingUrls.has(item.detailUrl);
                                    const isDone = imported.has(item.detailUrl);
                                    const isFail = failed.has(item.detailUrl);
                                    
                                    let statusBg = exists ? "bg-amber-50" : "";
                                    if(isDone) statusBg = "bg-emerald-50";
                                    if(isFail) statusBg = "bg-red-50";

                                    return (
                                        <tr key={i} className={`border-b border-slate-100 hover:bg-slate-50 ${statusBg}`}>
                                            <td className="p-3">
                                                {isDone ? (
                                                    <span className="flex items-center text-emerald-600 font-medium"><Check size={14} className="mr-1"/> Importada</span>
                                                ) : isFail ? (
                                                    <span className="flex items-center text-red-600 font-medium"><AlertCircle size={14} className="mr-1"/> Error</span>
                                                ) : exists ? (
                                                    <span className="text-amber-600 text-xs font-mono bg-amber-100 px-2 py-1 rounded">EXISTENTE</span>
                                                ) : (
                                                    <span className="text-emerald-600 text-xs font-mono bg-emerald-100 px-2 py-1 rounded">NUEVA</span>
                                                )}
                                            </td>
                                            <td className="p-3 font-medium text-slate-800 truncate max-w-xs" title={item.title}>
                                                {item.title}
                                            </td>
                                            <td className="p-3 text-slate-600">{item.country}</td>
                                            <td className="p-3 text-blue-500 underline truncate max-w-xs">
                                                <a href={item.detailUrl} target="_blank" rel="noreferrer">Ver Fuente</a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    </AdminLayout>
  );
}
