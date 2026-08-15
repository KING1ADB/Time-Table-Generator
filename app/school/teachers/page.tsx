import { prisma } from '@/lib/db/prisma';
import TeachersClient from './TeachersClient';

export default async function TeachersPage() {
  const school = await prisma.school.findFirst({ where: { code: 'MBOA-01' } });
  const schoolId = school?.id || 'school_mboa_college_01';

  const teachers = await prisma.teacher.findMany({
    where: { schoolId },
    include: { availability: true },
    orderBy: { name: 'asc' },
  });

  return <TeachersClient initialTeachers={teachers} schoolId={schoolId} />;
}
