import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getAuthenticatedSchool } from '@/lib/auth/tenantGuard';
import SchoolSidebarWrapper from '@/components/layout/SchoolSidebarWrapper';

export default async function SchoolLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const school = await getAuthenticatedSchool();
  const schoolName = school?.name || 'School Workspace';
  const schoolType = school?.type || 'BILINGUAL';
  const userEmail = session.user.email || 'school.admin@minesec.gov.cm';

  return (
    <SchoolSidebarWrapper
      schoolName={schoolName}
      schoolType={schoolType}
      userEmail={userEmail}
    >
      {children}
    </SchoolSidebarWrapper>
  );
}
