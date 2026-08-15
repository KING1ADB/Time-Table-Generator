import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import { getTimetableData } from '@/lib/actions/timetableActions';
import TimetableClient from './TimetableClient';

export default async function TimetablePage() {
  const schoolId = await getAuthenticatedSchoolId();
  const initialData = await getTimetableData(schoolId);

  return <TimetableClient schoolId={schoolId} initialData={initialData} />;
}
