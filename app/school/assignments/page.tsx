import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import { getSchoolDataPreValidation } from '@/lib/actions/schoolActions';
import AssignmentsClient from './AssignmentsClient';

export default async function AssignmentsPage() {
  const schoolId = await getAuthenticatedSchoolId();

  const [teachers, sections, subjects, assignments, preValidation] = await Promise.all([
    prisma.teacher.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    prisma.classSection.findMany({
      where: { class: { schoolId } },
      include: { class: true },
      orderBy: { name: 'asc' },
    }),
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    prisma.teachingAssignment.findMany({
      where: { schoolId },
      include: {
        teacher: true,
        classSection: { include: { class: true } },
        subject: true,
      },
      orderBy: { id: 'desc' },
    }),
    getSchoolDataPreValidation(schoolId),
  ]);

  return (
    <AssignmentsClient
      schoolId={schoolId}
      teachers={teachers}
      sections={sections}
      subjects={subjects}
      initialAssignments={assignments}
      preValidation={preValidation}
    />
  );
}
