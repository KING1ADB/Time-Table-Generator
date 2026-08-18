import { getProvisionedSchoolsAction } from '@/lib/actions/superAdminActions';
import SchoolsClient from './SchoolsClient';

export const dynamic = 'force-dynamic';

export default async function SchoolsAdminPage() {
  let schools: any[] = [];
  try {
    schools = await getProvisionedSchoolsAction();
  } catch (err) {
    console.error('SchoolsAdminPage fetch error:', err);
  }

  return <SchoolsClient initialSchools={schools} />;
}
