import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import ClassesClient from './ClassesClient';

export default async function ClassesPage() {
  const schoolId = await getAuthenticatedSchoolId();

  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: { sections: true },
    orderBy: { name: 'asc' },
  });

  return <ClassesClient initialClasses={classes} schoolId={schoolId} />;
}
