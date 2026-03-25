import React from 'react';
import ReturnBookClient from './ReturnBookClient';
import { db } from '@/lib/db';

export const metadata = {
  title: 'Return Book | The Archivist',
};

export default async function ReturnBookPage() {
  const settings = await db.globalSettings.findUnique({ where: { id: 'default' }});
  const fineRatePerDay = settings?.fineRatePerDay ?? 10;
  return <ReturnBookClient fineRatePerDay={fineRatePerDay} />;
}
