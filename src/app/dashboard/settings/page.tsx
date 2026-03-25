import React from 'react';
import { getSettingsAction } from '@/actions/settings.actions';
import SettingsForm from './SettingsForm';

export const metadata = {
  title: 'Global Settings | The Archivist',
};

export default async function SettingsPage() {
  const settings = await getSettingsAction();
  
  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0A0A0A]">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Global Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure library identity, loan limits, and financial parameters natively across the client.</p>
      </div>

      <SettingsForm initialData={settings} />
    </main>
  );
}
