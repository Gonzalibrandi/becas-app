"use client";

import { useState } from "react";
import { Trash2, Check, ChevronDown, X } from "lucide-react";
import ConfirmModal, { ResultModal } from "@/components/Modal";

type BulkAction = "delete" | "changeStatus";

interface BulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Borrador", icon: "📝" },
  { value: "REVIEW", label: "Revisión", icon: "👁️" },
  { value: "PUBLISHED", label: "Publicada", icon: "✅" },
  { value: "ARCHIVED", label: "Archivada", icon: "📦" },
];

export default function BulkActions({ selectedIds, onClearSelection, onActionComplete }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: BulkAction;
    payload?: { status: string };
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: "delete",
    title: "",
    message: "",
  });
  
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "success",
  });

  const showConfirmation = (action: BulkAction, payload?: { status: string }) => {
    if (action === "delete") {
      setConfirmModal({
        isOpen: true,
        action,
        payload,
        title: "Eliminar becas",
        message: `¿Estás seguro de que querés eliminar ${selectedIds.length} beca${selectedIds.length > 1 ? "s" : ""}? Esta acción no se puede deshacer.`,
      });
    } else if (action === "changeStatus" && payload?.status) {
      const statusLabel = STATUS_OPTIONS.find(s => s.value === payload.status)?.label || payload.status;
      setConfirmModal({
        isOpen: true,
        action,
        payload,
        title: "Cambiar estado",
        message: `¿Cambiar el estado de ${selectedIds.length} beca${selectedIds.length > 1 ? "s" : ""} a "${statusLabel}"?`,
      });
    }
    setShowStatusMenu(false);
  };

  const performAction = async () => {
    const { action, payload } = confirmModal;
    
    setLoading(true);
    try {
      const res = await fetch("/api/scholarships/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action, payload }),
      });

      const data = await res.json();
      
      setConfirmModal({ ...confirmModal, isOpen: false });
      
      if (res.ok) {
        setResultModal({
          isOpen: true,
          title: action === "delete" ? "Becas eliminadas" : "Estado actualizado",
          message: data.message,
          variant: "success",
        });
        onClearSelection();
        onActionComplete();
      } else {
        setResultModal({
          isOpen: true,
          title: "Error",
          message: data.error || "Error al ejecutar la acción",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setConfirmModal({ ...confirmModal, isOpen: false });
      setResultModal({
        isOpen: true,
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium">seleccionadas</span>
          </div>

          <div className="w-px h-6 bg-slate-700" />

          {/* Change Status */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Check size={16} />
              <span>Cambiar estado</span>
              <ChevronDown size={14} />
            </button>

            {showStatusMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[160px]">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => showConfirmation("changeStatus", { status: status.value })}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-100 flex items-center gap-2"
                  >
                    <span>{status.icon}</span>
                    <span>{status.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => showConfirmation("delete")}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span>Eliminar</span>
          </button>

          <div className="w-px h-6 bg-slate-700" />

          {/* Clear selection */}
          <button
            onClick={onClearSelection}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={performAction}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.action === "delete" ? "Eliminar" : "Cambiar estado"}
        variant={confirmModal.action === "delete" ? "danger" : "info"}
        isLoading={loading}
      />

      {/* Result Modal */}
      <ResultModal
        isOpen={resultModal.isOpen}
        onClose={() => setResultModal({ ...resultModal, isOpen: false })}
        title={resultModal.title}
        message={resultModal.message}
        variant={resultModal.variant}
      />
    </>
  );
}
