import React from 'react';
import { auth } from '@/lib/auth/auth';
import AdminSidebarWrapper from '@/components/layout/AdminSidebarWrapper';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userEmail = session?.user?.email || 'admin@minesec.gov.cm';

  return <AdminSidebarWrapper userEmail={userEmail}>{children}</AdminSidebarWrapper>;
}
