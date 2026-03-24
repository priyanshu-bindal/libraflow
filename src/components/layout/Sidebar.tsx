import React from 'react';
import { auth } from '@/lib/auth';
import SidebarClient from './SidebarClient';

export default async function Sidebar() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  return (
    <SidebarClient user={session?.user} isSuperAdmin={isSuperAdmin} />
  );
}
