import { getProvisionedSchoolsAction } from '@/lib/actions/superAdminActions';
import SchoolsClient from './SchoolsClient';

export default async function SchoolsAdminPage() {
  const schools = await getProvisionedSchoolsAction();
  return <SchoolsClient initialSchools={schools} />;
}
