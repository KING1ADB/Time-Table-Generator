import { prisma } from '@/lib/db/prisma';
import { getTimetableData } from '@/lib/actions/timetableActions';
import TimetableClient from './TimetableClient';

export default async function TimetablePage() {
  const school = await prisma.school.findFirst({
    where: { code: 'MBOA-01' },
  });

  const schoolId = school?.id || '';
  const initialData = await getTimetableData(schoolId);

  return <TimetableClient schoolId={schoolId} initialData={initialData} />;
}
