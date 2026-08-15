import { prisma } from '@/lib/db/prisma';
import { getSchoolDataPreValidation } from '@/lib/actions/schoolActions';
import AssignmentsClient from './AssignmentsClient';

export default async function AssignmentsPage() {
  const school = await prisma.school.findFirst({ where: { code: 'MBOA-01' } });
  const schoolId = school?.id || 'school_mboa_college_01';

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
