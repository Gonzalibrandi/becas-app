"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, X, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "success" | "warning" | "info";
  isLoading?: boolean;
}

const variantStyles = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBtn: "bg-red-600 hover:bg-red-700",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    confirmBtn: "bg-emerald-600 hover:bg-emerald-700",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    confirmBtn: "bg-amber-600 hover:bg-amber-700",
  },
  info: {
    icon: RefreshCw,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBtn: "bg-blue-600 hover:bg-blue-700",
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isLoading) return;
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`w-14 h-14 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon size={28} className={styles.iconColor} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 ${styles.confirmBtn} text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Result modal for showing success/error messages
interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "success" | "error";
}

export function ResultModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "success",
}: ResultModalProps) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  if (!isOpen) return null;

  const isSuccess = variant === "success";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="p-6">
          {/* Icon */}
          <div className={`w-14 h-14 ${isSuccess ? "bg-emerald-100" : "bg-red-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {isSuccess ? (
              <CheckCircle size={28} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={28} className="text-red-600" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={`w-full px-4 py-2.5 ${isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-600 hover:bg-gray-700"} text-white rounded-xl font-medium transition-colors`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
