import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import ClassesClient from './ClassesClient';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const schoolId = await getAuthenticatedSchoolId();

  let classes: any[] = [];
  try {
    classes = await prisma.class.findMany({
      where: { schoolId },
      include: { sections: true },
      orderBy: { name: 'asc' },
    });
  } catch (err) {
    console.error('ClassesPage fetch error:', err);
  }

  return <ClassesClient initialClasses={classes} schoolId={schoolId} />;
}
