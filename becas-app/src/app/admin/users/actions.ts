"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function banUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, error: "Error al banear usuario" };
  }
}

export async function unbanUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { success: false, error: "Error al desbanear usuario" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Error al eliminar usuario" };
  }
}
