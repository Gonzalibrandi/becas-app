"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "16px",
          background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
        }}>
          <div style={{
            width: 80,
            height: 80,
            background: "#fee2e2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}>
            <AlertTriangle size={40} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
            Error crítico
          </h1>
          <p style={{ color: "#6b7280", maxWidth: 400, margin: "0 0 24px" }}>
            La aplicación encontró un error inesperado. Por favor intentá de nuevo.
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: "#059669",
              color: "white",
              fontWeight: 600,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <RefreshCw size={18} />
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
