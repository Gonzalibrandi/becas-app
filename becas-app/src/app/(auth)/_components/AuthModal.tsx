"use client";

import { useRouter } from "next/navigation";
import { X, Heart, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push("/login");
  };

  const handleRegister = () => {
    onClose();
    router.push("/register");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
            <Heart className="text-rose-500" size={32} />
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
    </div>
  );
}
