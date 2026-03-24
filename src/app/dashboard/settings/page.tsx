// src/app/dashboard/settings/page.tsx
import { getGlobalSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const settings = await getGlobalSettings();
  const session = await auth();

  // Convert decimal to number for form state
  const plainSettings = {
    ...settings,
    address: settings.address || "",
    contactPhone: settings.contactPhone || "",
    fineRatePerDay: Number(settings.fineRatePerDay),
    maxFineCap: Number(settings.maxFineCap),
    // Pass user info for Account tab
    userId: session?.user?.id || "",
    userName: session?.user?.name || "",
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <SettingsForm initialData={plainSettings} />
    </div>
  );
}
