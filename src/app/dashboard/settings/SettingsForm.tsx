"use client";

import React, { useState, useTransition } from 'react';
import { updateSettingsAction } from '@/actions/settings.actions';
import { toast } from 'sonner';
import { Save, Library, KeyRound, Receipt, Loader2, BookOpen } from 'lucide-react';

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    libraryName: initialData?.libraryName || 'LibraFlow',
    contactEmail: initialData?.contactEmail || 'admin@libraflow.com',
    fineRatePerDay: initialData?.fineRatePerDay || 10,
    maxBooksPerUser: initialData?.maxBooksPerUser || 3,
    loanPeriodDays: initialData?.loanPeriodDays || 14,
    renewalLimit: initialData?.renewalLimit || 2,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateSettingsAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-12">
      
      {/* Library Identity Card */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
             <Library className="text-blue-500 w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Library Identity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Library Name</label>
            <input 
              name="libraryName"
              value={formData.libraryName}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-500 mt-2">This name appears globally in the Sidebar and receipts.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Email</label>
            <input 
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Loan Limitations Card */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
             <BookOpen className="text-purple-500 w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Loan Limitations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max Books / Member</label>
            <input 
              type="number"
              min="1"
              max="20"
              name="maxBooksPerUser"
              value={formData.maxBooksPerUser}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loan Period (Days)</label>
            <input 
              type="number"
              min="1"
              max="365"
              name="loanPeriodDays"
              value={formData.loanPeriodDays}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-500 mt-2">Base duration before a book is marked OVERDUE.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Renewal Limit</label>
            <input 
              type="number"
              min="0"
              max="10"
              name="renewalLimit"
              value={formData.renewalLimit}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Financial Parameters Card */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
             <Receipt className="text-emerald-500 w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Financial Parameters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fine Rate (₹ per day)</label>
            <div className="relative">
              
              <span className="absolute left-4 top-3 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              <input 
                type="number"
                step="0.5"
                min="0"
                name="fineRatePerDay"
                value={formData.fineRatePerDay}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 pl-8 pr-4 text-emerald-400 font-black text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              />
             
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Calculated daily when a book is verified as overdue during the Return workflow.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4">
         <button 
           type="submit" 
           disabled={isPending}
           className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-slate-200 text-black rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
           {isPending ? 'Saving Constraints...' : 'Save Global Settings'}
         </button>
      </div>
    </form>
  );
}
