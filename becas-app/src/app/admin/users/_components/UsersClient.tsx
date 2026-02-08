"use client";

import { useState, useTransition } from "react";
import { Ban, Unlock, Trash2, MoreVertical, Loader2, AlertTriangle } from "lucide-react";
import { banUser, unbanUser, deleteUser } from "../actions";

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

interface UsersClientProps {
  users: User[];
}

export default function UsersClient({ users }: UsersClientProps) {
  const [isPending, startTransition] = useTransition();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleBan = (userId: string) => {
    startTransition(async () => {
      await banUser(userId);
      setOpenMenu(null);
    });
  };

  const handleUnban = (userId: string) => {
    startTransition(async () => {
      await unbanUser(userId);
      setOpenMenu(null);
    });
  };

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      await deleteUser(userId);
      setConfirmDelete(null);
      setOpenMenu(null);
    });
  };

  const getInitials = (firstName: string | null, lastName: string | null, username: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(user.firstName, user.lastName, user.username)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.username}
                      </p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {user.isActive ? "Activo" : "Baneado"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {user.isActive ? (
                      <button
                        onClick={() => handleBan(user.id)}
                        disabled={isPending}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Banear usuario"
                      >
                        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnban(user.id)}
                        disabled={isPending}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Desbanear usuario"
                      >
                        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Unlock size={18} />}
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      disabled={isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {getInitials(user.firstName, user.lastName, user.username)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical size={18} />
                </button>
                {openMenu === user.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                    {user.isActive ? (
                      <button
                        onClick={() => handleBan(user.id)}
                        className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                      >
                        <Ban size={16} /> Banear
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnban(user.id)}
                        className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                      >
                        <Unlock size={16} /> Desbanear
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 text-sm">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user.isActive 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {user.isActive ? "Activo" : "Baneado"}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">¿Eliminar usuario?</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
