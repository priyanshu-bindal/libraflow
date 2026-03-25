import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import SidebarClient from './SidebarClient';

export default async function Sidebar() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const settings = await db.globalSettings.findUnique({ where: { id: 'default' }});
  const libraryName = settings?.libraryName || 'LibraFlow';

  return (
    <SidebarClient user={session?.user} isSuperAdmin={isSuperAdmin} libraryName={libraryName} />
  );
}
