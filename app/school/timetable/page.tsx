import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import { getTimetableData } from '@/lib/actions/timetableActions';
import TimetableClient from './TimetableClient';

export const dynamic = 'force-dynamic';

export default async function TimetablePage() {
  const schoolId = await getAuthenticatedSchoolId();
  let initialData: any = null;

  try {
    initialData = await getTimetableData(schoolId);
  } catch (err) {
    console.error('TimetablePage fetch error:', err);
  }

  return <TimetableClient schoolId={schoolId} initialData={initialData} />;
}
