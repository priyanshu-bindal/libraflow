"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition, useEffect } from "react";
import { updateGlobalSettingsAction, GlobalSettingsInput } from "@/actions/settings.actions";
import { updateAccountProfile } from "@/actions/user.actions";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Library, Gavel, IndianRupee, Bell, ShieldCheck, User, Save, Database } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
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
  userName: z.string().min(1, "Name is required").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await updateGlobalSettingsAction(data);
        
        // Update user account name if changed
        if (data.userName && initialData.userId) {
          const res = await updateAccountProfile(initialData.userId, data.userName);
          if (!res.success) throw new Error("Failed to update profile name");
        }

        toast.success("Settings updated successfully");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Failed to update settings");
      }
    });
  };

  const navItems = [
    { id: "general", label: "General", icon: Library },
    { id: "loan-rules", label: "Loan Rules", icon: Gavel },
    { id: "fine-settings", label: "Fine Settings", icon: IndianRupee },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "account", label: "Account", icon: User },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-fit pb-0">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-white tracking-tight">Settings</h2>
          <p className="text-on-surface-variant mt-2 font-medium">Configure your library system preferences</p>
        </div>
        <button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-white font-bold shadow-lg shadow-red-600/20"
        >
          <Save size={18} />
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-10">
        <nav className="w-64 flex-shrink-0 flex flex-col gap-2 rounded-xl sticky top-8 h-fit">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
            <button
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-red-900/20 border-l-4 border-red-600 text-red-500 shadow-sm shadow-red-500/5" 
                  : "text-[#9CA3AF] hover:bg-surface-container hover:text-white"
              }`}
            >
              <Icon size={18} className="mr-3" />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          )})}
        </nav>

        <div className="flex-1 space-y-8 pb-8">
          <FormProvider {...form}>
            <form className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-10 shadow-2xl shadow-black/40">
            
            {/* General */}
            <div id="general" className="mb-12 scroll-mt-10">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] border-b border-[#1F1F1F] pb-4 mb-8">Library Information</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Library Name</label>
                  <input {...form.register("libraryName")} className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all" />
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Library Email</label>
                  <input {...form.register("libraryEmail")} type="email" className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all" />
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Contact Phone</label>
                  <input {...form.register("contactPhone")} className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all" />
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Address</label>
                  <textarea {...form.register("address")} rows={1} className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* Loan Rules */}
            <div id="loan-rules" className="mb-12 scroll-mt-10">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] border-b border-[#1F1F1F] pb-4 mb-4">Loan Rules</h3>
              <div className="space-y-0">
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F] group">
                  <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-white transition-colors">Default Loan Period</span>
                  <div className="flex items-center gap-4">
                    <input {...form.register("defaultLoanPeriod", { valueAsNumber: true })} type="number" className="w-24 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg h-11 text-center text-white text-sm focus:border-red-600 outline-none" />
                    <span className="text-xs text-gray-500 font-medium w-12 uppercase tracking-widest">days</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F] group">
                  <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-white transition-colors">Maximum Books Per Member</span>
                  <div className="flex items-center gap-4">
                    <input {...form.register("maxBooksPerMember", { valueAsNumber: true })} type="number" className="w-24 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg h-11 text-center text-white text-sm focus:border-red-600 outline-none" />
                    <span className="text-xs text-gray-500 font-medium w-12 uppercase tracking-widest">books</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F] group">
                  <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-white transition-colors">Renewal Limit</span>
                  <div className="flex items-center gap-4">
                    <input {...form.register("renewalLimit", { valueAsNumber: true })} type="number" className="w-24 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg h-11 text-center text-white text-sm focus:border-red-600 outline-none" />
                    <span className="text-xs text-gray-500 font-medium w-12 uppercase tracking-widest">renewals</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F] group">
                  <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-white transition-colors">Reservation Hold Period</span>
                  <div className="flex items-center gap-4">
                    <input {...form.register("reservationHoldPeriod", { valueAsNumber: true })} type="number" className="w-24 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg h-11 text-center text-white text-sm focus:border-red-600 outline-none" />
                    <span className="text-xs text-gray-500 font-medium w-12 uppercase tracking-widest">days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fine Settings */}
            <div id="fine-settings" className="mb-12 scroll-mt-10">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] border-b border-[#1F1F1F] pb-4 mb-4">Fine Settings</h3>
              <div className="space-y-0">
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F] group">
                  <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-white transition-colors">Fine Rate Per Day</span>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <span className="absolute left-3 top-[12px] text-sm text-gray-500">₹</span>
                      <input {...form.register("fineRatePerDay", { valueAsNumber: true })} type="number" step="0.01" className="w-32 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg h-11 text-center text-white text-sm focus:border-red-600 outline-none font-semibold pl-6" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">per overdue day</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F] group">
                  <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-white transition-colors">Grace Period</span>
                  <div className="flex items-center gap-4">
                    <input {...form.register("gracePeriod", { valueAsNumber: true })} type="number" className="w-24 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg h-11 text-center text-white text-sm focus:border-red-600 outline-none" />
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">days before fine</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F] group">
                  <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-white transition-colors">Maximum Fine Cap</span>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <span className="absolute left-3 top-[12px] text-sm text-gray-500">₹</span>
                      <input {...form.register("maxFineCap", { valueAsNumber: true })} type="number" step="0.01" className="w-32 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg h-11 text-center text-white text-sm focus:border-red-600 outline-none font-semibold pl-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div id="notifications" className="mb-4 scroll-mt-10">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] border-b border-[#1F1F1F] pb-4 mb-4">Notifications</h3>
              <div className="space-y-0">
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F]">
                  <div>
                    <p className="text-sm font-medium text-white">Email overdue reminders</p>
                    <p className="text-[11px] text-[#4B5563] mt-1 font-medium">Send automatic alerts to patrons with overdue items</p>
                  </div>
                  <Switch checked={form.watch("emailOverdueReminders")} onCheckedChange={(val) => form.setValue("emailOverdueReminders", val, { shouldDirty: true })} />
                </div>
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F]">
                  <div>
                    <p className="text-sm font-medium text-white">SMS notifications</p>
                    <p className="text-[11px] text-[#4B5563] mt-1 font-medium">Deliver instant text messages for high-priority alerts</p>
                  </div>
                  <Switch checked={form.watch("smsNotifications")} onCheckedChange={(val) => form.setValue("smsNotifications", val, { shouldDirty: true })} />
                </div>
                <div className="flex justify-between items-center py-5 border-b border-[#1F1F1F]">
                  <div>
                    <p className="text-sm font-medium text-white">Fine payment receipts</p>
                    <p className="text-[11px] text-[#4B5563] mt-1 font-medium">Automatically email digital receipts after transaction</p>
                  </div>
                  <Switch checked={form.watch("finePaymentReceipts")} onCheckedChange={(val) => form.setValue("finePaymentReceipts", val, { shouldDirty: true })} />
                </div>
                <div className="flex justify-between items-center py-5">
                  <div>
                    <p className="text-sm font-medium text-white">New member welcome email</p>
                    <p className="text-[11px] text-[#4B5563] mt-1 font-medium">Send on-boarding guide to newly registered patrons</p>
                  </div>
                  <Switch checked={form.watch("newMemberWelcomeEmail")} onCheckedChange={(val) => form.setValue("newMemberWelcomeEmail", val, { shouldDirty: true })} />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div id="account" className="mb-4 scroll-mt-10">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] border-b border-[#1F1F1F] pb-4 mb-8">My Account</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2 mb-4 col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Display Name</label>
                  <input {...form.register("userName")} className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-[#1F1F1F] mt-10 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => form.reset()}
                className="px-6 py-2.5 rounded-lg text-[#6B7280] text-sm font-bold hover:text-white transition-colors"
              >
                Reset to Defaults
              </button>
              <button 
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-white font-bold h-11 shadow-lg shadow-red-600/20"
              >
                <Save size={18} />
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </FormProvider>

          {/* Visual Accent */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-[#111111]/60 border border-[#1F1F1F] rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Database size={18} />
                    </div>
                    <span className="text-sm font-bold text-white">DB Integrity</span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">System automatically performs health checks daily at 03:00 AM.</p>
            </div>
            
            <div className="col-span-2 bg-gradient-to-r from-[#111111] to-[#0D0D0D] border border-[#1F1F1F] rounded-2xl p-6 flex justify-between items-center">
                <div>
                    <h4 className="text-sm font-bold text-white">Storage Utilization</h4>
                    <p className="text-[11px] text-gray-500 mt-1">42.5 GB of 1 TB used (Cloud Backup Enabled)</p>
                </div>
                <div className="w-48 h-2 bg-[#0A0A0A] rounded-full overflow-hidden border border-[#1F1F1F]">
                    <div className="h-full bg-red-600 w-[42%]"></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
