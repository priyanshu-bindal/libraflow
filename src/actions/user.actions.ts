"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAccountProfile(userId: string, newName: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { name: newName },
    });

    // Force layout to deeply refetch, including Topbar
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile", error);
    return { success: false, error: "Failed to update profile" };
  }
}
