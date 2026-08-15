import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function getAuthenticatedSchoolId(): Promise<string> {
  const session = await auth();

  if (session?.user) {
    const schoolId = (session.user as any).schoolId;

    if (schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: { id: true, isActive: true },
      });
      if (school && school.isActive) {
        return school.id;
      }
    }

    const userId = (session.user as any).id;
    if (userId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { schoolId: true, school: { select: { id: true, isActive: true } } },
      });
      if (dbUser?.schoolId && dbUser.school?.isActive) {
        return dbUser.schoolId;
      }
    }
  }

  // Fallback to active school tenant
  const activeSchool = await prisma.school.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (activeSchool) {
    return activeSchool.id;
  }

  throw new Error('No active school tenant available.');
}

export async function getAuthenticatedSchool() {
  const schoolId = await getAuthenticatedSchoolId();
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });
  return school;
}
