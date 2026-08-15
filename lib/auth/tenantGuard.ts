import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function getAuthenticatedSchoolId(): Promise<string> {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthenticated: Please log in to access school resources.');
  }

  const schoolId = (session.user as any).schoolId;

  if (!schoolId) {
    throw new Error('Forbidden: No school tenant associated with this user session.');
  }

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { isActive: true },
  });

  if (!school || !school.isActive) {
    throw new Error(
      'Account Suspended: Your school subscription is currently inactive. Contact system administration.'
    );
  }

  return schoolId;
}
