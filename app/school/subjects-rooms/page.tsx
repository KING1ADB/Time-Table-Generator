import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import SubjectsRoomsClient from './SubjectsRoomsClient';

export const dynamic = 'force-dynamic';

export default async function SubjectsRoomsPage() {
  const schoolId = await getAuthenticatedSchoolId();

  let subjects: any[] = [];
  let rooms: any[] = [];
  try {
    const res = await Promise.all([
      prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
      prisma.room.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    ]);
    subjects = res[0];
    rooms = res[1];
  } catch (err) {
    console.error('SubjectsRoomsPage fetch error:', err);
  }

  return <SubjectsRoomsClient initialSubjects={subjects} initialRooms={rooms} schoolId={schoolId} />;
}
