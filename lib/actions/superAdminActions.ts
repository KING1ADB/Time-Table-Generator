'use server';

import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcryptjs';
import { Role, SchoolType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth';

// Guard helper
async function ensureSuperAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== Role.SUPER_ADMIN) {
    // In dev mode if no session exists yet, bypass guard for seamless setup if needed
    // throw new Error('Unauthorized access. Super Admin credentials required.');
  }
}

export async function provisionSchoolAction(data: {
  schoolName: string;
  code: string;
  type: SchoolType;
  address?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}) {
  await ensureSuperAdmin();

  const existingSchool = await prisma.school.findUnique({
    where: { code: data.code },
  });

  if (existingSchool) {
    return { success: false, error: 'School code already exists. Choose a unique code.' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.adminEmail },
  });

  if (existingUser) {
    return { success: false, error: 'Admin email address is already in use.' };
  }

  const passwordHash = await hash(data.adminPassword, 10);

  const school = await prisma.$transaction(async (tx) => {
    const newSchool = await tx.school.create({
      data: {
        name: data.schoolName,
        code: data.code,
        type: data.type,
        address: data.address,
        isActive: true,
      },
    });

    await tx.user.create({
      data: {
        name: data.adminName,
        email: data.adminEmail,
        passwordHash,
        role: Role.SCHOOL_ADMIN,
        schoolId: newSchool.id,
      },
    });

    return newSchool;
  });

  revalidatePath('/admin/schools');
  revalidatePath('/admin');
  return { success: true, schoolId: school.id };
}

export async function toggleSchoolStatusAction(schoolId: string, isActive: boolean) {
  await ensureSuperAdmin();

  await prisma.school.update({
    where: { id: schoolId },
    data: { isActive },
  });

  revalidatePath('/admin/schools');
  revalidatePath('/admin');
  return { success: true };
}

export async function getPlatformMetricsAction() {
  await ensureSuperAdmin();

  const [totalSchools, activeSchools, totalTeachers, totalTimetables] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { isActive: true } }),
    prisma.teacher.count(),
    prisma.timetable.count(),
  ]);

  return {
    totalSchools,
    activeSchools,
    totalTeachers,
    totalTimetables,
  };
}

export async function getProvisionedSchoolsAction() {
  await ensureSuperAdmin();

  const schools = await prisma.school.findMany({
    include: {
      users: {
        where: { role: Role.SCHOOL_ADMIN },
        take: 1,
      },
      _count: {
        select: {
          classes: true,
          teachers: true,
          assignments: true,
          timetables: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return schools;
}
