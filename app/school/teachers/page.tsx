import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import TeachersClient from './TeachersClient';

export default async function TeachersPage() {
  const schoolId = await getAuthenticatedSchoolId();

  const teachers = await prisma.teacher.findMany({
    where: { schoolId },
    include: { availability: true },
    orderBy: { name: 'asc' },
  });

  return <TeachersClient initialTeachers={teachers} schoolId={schoolId} />;
}
