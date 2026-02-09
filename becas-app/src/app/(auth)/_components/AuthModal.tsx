"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Heart, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure we only render on client to avoid hydration errors
  useEffect(() => {
    setMounted(true);
    
    // Block body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => { 
      document.body.style.overflow = 'unset'; 
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
    router.push("/login");
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
    router.push("/register");
  };

  // Use createPortal to render modal at document.body level
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
            <Heart className="text-rose-500 fill-rose-500" size={32} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ¡Guardá tus becas favoritas!
          </h2>
          <p className="text-gray-500 text-sm">
            Para guardar becas y acceder a ellas después, necesitas una cuenta.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleLogin}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <LogIn size={18} />
            Iniciar Sesión
          </Button>

          <Button
            onClick={handleRegister}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <UserPlus size={18} />
            Crear Cuenta
          </Button>
        </div>

        {/* Skip */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Ahora no, gracias
        </button>
      </div>
    </div>,
    document.body
  );
}
