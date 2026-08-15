import { prisma } from '@/lib/db/prisma';
import SubjectsRoomsClient from './SubjectsRoomsClient';

export default async function SubjectsRoomsPage() {
  const school = await prisma.school.findFirst({ where: { code: 'MBOA-01' } });
  const schoolId = school?.id || 'school_mboa_college_01';

  const [subjects, rooms] = await Promise.all([
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    prisma.room.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
  ]);

  return <SubjectsRoomsClient initialSubjects={subjects} initialRooms={rooms} schoolId={schoolId} />;
}
