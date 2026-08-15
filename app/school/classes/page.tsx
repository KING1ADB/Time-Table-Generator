import { prisma } from '@/lib/db/prisma';
import ClassesClient from './ClassesClient';

export default async function ClassesPage() {
  // Hardcoded default school ID for seed
  const school = await prisma.school.findFirst({ where: { code: 'MBOA-01' } });
  const schoolId = school?.id || 'school_mboa_college_01';

  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: { sections: true },
    orderBy: { name: 'asc' },
  });

  return <ClassesClient initialClasses={classes} schoolId={schoolId} />;
}
