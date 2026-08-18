import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import { getSchoolDataPreValidation } from '@/lib/actions/schoolActions';
import AssignmentsClient from './AssignmentsClient';

export const dynamic = 'force-dynamic';

export default async function AssignmentsPage() {
  const schoolId = await getAuthenticatedSchoolId();

  let teachers: any[] = [];
  let sections: any[] = [];
  let subjects: any[] = [];
  let assignments: any[] = [];
  let preValidation: any = {
    isValid: true,
    totalClassSections: 0,
    totalAvailableSlotCapacity: 0,
    totalAssignedPeriods: 0,
    numDays: 5,
    numPeriodsPerDay: 7,
    slotsPerClassPerWeek: 35,
    warnings: [],
  };

  try {
    const res = await Promise.all([
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
    teachers = res[0];
    sections = res[1];
    subjects = res[2];
    assignments = res[3];
    preValidation = res[4];
  } catch (err) {
    console.error('AssignmentsPage fetch error:', err);
  }

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
