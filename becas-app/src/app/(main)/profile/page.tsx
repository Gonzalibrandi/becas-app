import { redirect } from "next/navigation";
import { getCurrentUser, updateUserProfile } from "@/lib/auth/user";
import ProfileForm from "./ProfileForm";
import { User, Calendar, Heart, Star } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Server Action for profile update
  async function handleUpdateProfile(formData: FormData) {
    "use server";
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!user) return { error: "No autorizado" };

    const updated = await updateUserProfile(user.id, {
      firstName,
      lastName,
    });

    if (!updated) {
      return { error: "Error al actualizar perfil" };
    }

    return { success: true };
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 sm:p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-2xl">
            {initials}
          </div>

          {/* User Info */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-emerald-100 text-lg">@{user.username}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-emerald-200/80 text-sm">
              <Calendar size={16} />
              <span>Miembro desde {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-white/60 text-sm mb-1">
              <Heart size={14} />
              <span>Favoritas</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-white/60 text-sm mb-1">
              <Star size={14} />
              <span>Aplicadas</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-white/60 text-sm mb-1">
              <User size={14} />
              <span>Nivel</span>
            </div>
            <p className="text-2xl font-bold text-white">Nuevo</p>
          </div>
        </div>
      </div>

      {/* Profile Form Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Perfil</h2>
        <ProfileForm user={user} updateAction={handleUpdateProfile} />
      </div>
    </div>
  );
}

