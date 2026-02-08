"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Input } from "@/components/ui";
import { Mail, Lock, Loader2 } from "lucide-react";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email o usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    const result = await login(data.emailOrUsername, data.password);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="shadow-xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
        <p className="text-gray-500 mt-1">Accede a tu cuenta</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Email o Usuario"
            type="text"
            placeholder="tu@email.com o username"
            leftIcon={<Mail size={18} />}
            {...register("emailOrUsername")}
          />
          {errors.emailOrUsername && (
            <p className="text-red-500 text-xs mt-1">{errors.emailOrUsername.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
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
              Ingresando...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Registrate
        </Link>
      </div>
    </Card>
  );
}
