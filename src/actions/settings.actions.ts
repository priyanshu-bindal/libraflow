"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSettingsAction() {
  let settings = await db.globalSettings.findUnique({
    where: { id: "default" }
  });

  if (!settings) {
    settings = await db.globalSettings.create({
      data: { id: "default" }
    });
  }

  return settings;
}

export async function updateSettingsAction(data: any) {
  try {
    const settings = await db.globalSettings.upsert({
      where: { id: "default" },
      update: {
        libraryName: data.libraryName,
        contactEmail: data.contactEmail,
        fineRatePerDay: parseFloat(data.fineRatePerDay),
        maxBooksPerUser: parseInt(data.maxBooksPerUser, 10),
        loanPeriodDays: parseInt(data.loanPeriodDays, 10),
        renewalLimit: parseInt(data.renewalLimit, 10),
      },
      create: {
        id: "default",
        libraryName: data.libraryName,
        contactEmail: data.contactEmail,
        fineRatePerDay: parseFloat(data.fineRatePerDay),
        maxBooksPerUser: parseInt(data.maxBooksPerUser, 10),
        loanPeriodDays: parseInt(data.loanPeriodDays, 10),
        renewalLimit: parseInt(data.renewalLimit, 10),
      }
    });

    // Revalidate everything so the UI elements immediately reflect changes globally
    revalidatePath('/', 'layout');

    return { success: true, message: 'Settings updated successfully.', settings };
  } catch (error) {
    console.error('Failed to update settings:', error);
    return { success: false, message: 'Internal server error while updating settings.' };
  }
}
