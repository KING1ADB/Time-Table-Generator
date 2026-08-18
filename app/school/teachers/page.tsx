import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import TeachersClient from './TeachersClient';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const schoolId = await getAuthenticatedSchoolId();

  let teachers: any[] = [];
  try {
    teachers = await prisma.teacher.findMany({
      where: { schoolId },
      include: { availability: true },
      orderBy: { name: 'asc' },
    });
  } catch (err) {
    console.error('TeachersPage fetch error:', err);
  }

  return <TeachersClient initialTeachers={teachers} schoolId={schoolId} />;
}
