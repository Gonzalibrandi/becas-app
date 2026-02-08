"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Input } from "@/components/ui";
import { Mail, Lock, User, Loader2 } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  username: z.string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    const result = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      password: data.password,
    });

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Error al registrarse");
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="shadow-xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
        <p className="text-gray-500 mt-1">Unite para guardar tus becas favoritas</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Nombre"
              type="text"
              placeholder="Juan"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Input
              label="Apellido"
              type="text"
              placeholder="Pérez"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <Input
            label="Usuario"
            type="text"
            placeholder="juanperez"
            leftIcon={<User size={18} />}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            leftIcon={<Mail size={18} />}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            leftIcon={<Lock size={18} />}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repetí tu contraseña"
            leftIcon={<Lock size={18} />}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creando cuenta...
            </>
          ) : (
            "Registrarse"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Iniciá Sesión
        </Link>
      </div>
    </Card>
  );
}
