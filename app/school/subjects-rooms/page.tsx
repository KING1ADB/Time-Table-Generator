import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import SubjectsRoomsClient from './SubjectsRoomsClient';

export default async function SubjectsRoomsPage() {
  const schoolId = await getAuthenticatedSchoolId();

  const [subjects, rooms] = await Promise.all([
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    prisma.room.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
  ]);

  return <SubjectsRoomsClient initialSubjects={subjects} initialRooms={rooms} schoolId={schoolId} />;
}
