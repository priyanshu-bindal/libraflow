"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

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

export interface CreateMemberInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export async function createMember(data: CreateMemberInput) {
  try {
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, error: "A user with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone || null,
        address: data.address || null,
        role: "USER",
      },

    });

    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (error) {
    console.error("Failed to create member", error);
    return { success: false, error: "Failed to create member. Please try again." };
  }
}

export async function suspendAccount(userId: string) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    const newStatus = (user as any).accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    await (db.user as any).update({
      where: { id: userId },
      data: { accountStatus: newStatus },
    });

    revalidatePath(`/dashboard/members/${userId}`);
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Failed to suspend account", error);
    return { success: false, error: "Failed to suspend account" };
  }
}

export async function markFinesAsPaid(userId: string) {
  try {
    const userTransactions = await db.transaction.findMany({
      where: { userId },
      select: { id: true },
    });
    
    const transactionIds = userTransactions.map((t: any) => t.id);

    await db.fine.updateMany({
      where: {
        transactionId: { in: transactionIds },
        paid: false
      },
      data: { paid: true, paidAt: new Date() }
    });

    revalidatePath(`/dashboard/members/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to mark fines as paid", error);
    return { success: false, error: "Failed to mark fines as paid" };
  }
}
