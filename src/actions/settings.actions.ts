"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const settingsSchema = z.object({
  libraryName: z.string().min(1),
  libraryEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  defaultLoanPeriod: z.number().int().min(1),
  maxBooksPerMember: z.number().int().min(1),
  renewalLimit: z.number().int().min(0),
  reservationHoldPeriod: z.number().int().min(1),
  fineRatePerDay: z.number().min(0),
  gracePeriod: z.number().int().min(0),
  maxFineCap: z.number().min(0),
  emailOverdueReminders: z.boolean(),
  smsNotifications: z.boolean(),
  finePaymentReceipts: z.boolean(),
  newMemberWelcomeEmail: z.boolean(),
});

export type GlobalSettingsInput = z.infer<typeof settingsSchema>;

export async function updateGlobalSettingsAction(data: GlobalSettingsInput) {
  const parsedData = settingsSchema.parse(data);

  await db.globalSettings.upsert({
    where: { id: "singleton" },
    update: parsedData,
    create: {
      id: "singleton",
      ...parsedData,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/", "layout");
}

export async function getFineRateAction() {
  const settings = await db.globalSettings.findUnique({
    where: { id: "singleton" },
  });
  return settings ? Number(settings.fineRatePerDay) : 2.0; // Fallback to 2.0 if not found
}
