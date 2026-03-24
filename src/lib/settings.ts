import { db } from "./db";

export async function getGlobalSettings() {
  let settings = await db.globalSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    settings = await db.globalSettings.create({
      data: {
        id: "singleton",
      },
    });
  }

  return settings;
}