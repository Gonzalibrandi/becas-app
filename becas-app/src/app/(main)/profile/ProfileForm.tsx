"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Button } from "@/components/ui";
import { User, Mail, AtSign, Save, Loader2, CheckCircle, Shield, Edit3 } from "lucide-react";

interface ProfileFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  };
  updateAction: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function ProfileForm({ user, updateAction }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    
    startTransition(async () => {
      const result = await updateAction(formData);
      
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: "Perfil actualizado correctamente" });
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" && <CheckCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Read-only fields Card */}
      <Card padding="lg" className="border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Shield size={20} className="text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Información de la cuenta</h3>
            <p className="text-sm text-gray-500">Estos datos no se pueden modificar</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <AtSign size={14} />
              <span>Usuario</span>
            </div>
            <p className="font-semibold text-gray-900">{user.username}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Mail size={14} />
              <span>Email</span>
            </div>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Editable fields Card */}
      <Card padding="lg" className="border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
        <form action={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Edit3 size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Información personal</h3>
              <p className="text-sm text-gray-500">Actualizá tus datos personales</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="firstName"
              type="text"
              defaultValue={user.firstName}
              leftIcon={<User size={16} />}
              required
            />

            <Input
              label="Apellido"
              name="lastName"
              type="text"
              defaultValue={user.lastName}
              leftIcon={<User size={16} />}
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" size="lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
