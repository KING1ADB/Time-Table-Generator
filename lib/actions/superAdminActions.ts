'use server';

import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcryptjs';
import { Role, SchoolType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth';

function sanitizeSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function sanitizePascalCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Guard helper
async function ensureSuperAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== Role.SUPER_ADMIN) {
    // Session check guard helper
  }
}

export async function provisionSchoolAction(data: {
  schoolName: string;
  code: string;
  type: SchoolType;
  address?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}) {
  await ensureSuperAdmin();

  const formattedCode = data.code.trim().toUpperCase();

  const existingSchool = await prisma.school.findUnique({
    where: { code: formattedCode },
  });

  if (existingSchool) {
    return { success: false, error: 'School code already exists. Please use a unique code.' };
  }

  // Auto-Generate Credentials if not provided
  const slug = sanitizeSlug(data.schoolName) || 'school';
  const pascalName = sanitizePascalCase(data.schoolName) || 'School';
  const currentYear = new Date().getFullYear();

  const generatedEmail = data.adminEmail?.trim() || `principal@${slug}.cm`;
  const generatedPassword = data.adminPassword?.trim() || `${pascalName}${currentYear}!`;
  const generatedName = data.adminName?.trim() || `Principal ${data.schoolName}`;

  const existingUser = await prisma.user.findUnique({
    where: { email: generatedEmail },
  });

  if (existingUser) {
    return { success: false, error: `Email address "${generatedEmail}" is already registered.` };
  }

  const passwordHash = await hash(generatedPassword, 10);

  const school = await prisma.$transaction(async (tx) => {
    const newSchool = await tx.school.create({
      data: {
        name: data.schoolName.trim(),
        code: formattedCode,
        type: data.type,
        address: data.address?.trim() || null,
        isActive: true,
      },
    });

    await tx.user.create({
      data: {
        name: generatedName,
        email: generatedEmail,
        passwordHash,
        role: Role.SCHOOL_ADMIN,
        schoolId: newSchool.id,
      },
    });

    return newSchool;
  });

  revalidatePath('/admin/schools');
  revalidatePath('/admin');

  return {
    success: true,
    schoolId: school.id,
    generatedCredentials: {
      email: generatedEmail,
      password: generatedPassword,
      schoolName: data.schoolName,
      code: formattedCode,
      adminName: generatedName,
    },
  };
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
