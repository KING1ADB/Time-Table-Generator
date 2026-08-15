'use server';

import { prisma } from '@/lib/db/prisma';
import { DayOfWeek, TimePreference } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';
import {
  SchoolSetupInput,
  ClassSectionInput,
  SubjectInput,
  RoomInput,
  TeacherInput,
  TeachingAssignmentInput,
  schoolSetupSchema,
  classSectionSchema,
  subjectSchema,
  roomSchema,
  teacherSchema,
  teachingAssignmentSchema,
} from '@/lib/validation/schemas';

// Helper to convert HH:MM to total minutes from 00:00
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper to format minutes to HH:MM
function minutesToTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export async function setupAcademicYearAndSchedule(
  schoolId: string,
  rawInput: SchoolSetupInput
) {
  const activeSchoolId = schoolId || (await getAuthenticatedSchoolId());
  const input = schoolSetupSchema.parse(rawInput);

  // Find or create current AcademicYear
  let academicYear = await prisma.academicYear.findFirst({
    where: { schoolId: activeSchoolId, isCurrent: true },
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        schoolId: activeSchoolId,
        year: input.year,
        isCurrent: true,
      },
    });
  } else if (academicYear.year !== input.year) {
    academicYear = await prisma.academicYear.update({
      where: { id: academicYear.id },
      data: { year: input.year },
    });
  }

  // Update SchoolDays
  await prisma.schoolDay.deleteMany({ where: { academicYearId: academicYear.id } });
  await prisma.schoolDay.createMany({
    data: input.days.map((d) => ({
      academicYearId: academicYear!.id,
      day: d as DayOfWeek,
    })),
  });

  // Recreate BreakSlots
  await prisma.breakSlot.deleteMany({ where: { academicYearId: academicYear.id } });
  if (input.breaks && input.breaks.length > 0) {
    await prisma.breakSlot.createMany({
      data: input.breaks.map((b) => ({
        academicYearId: academicYear!.id,
        name: b.name,
        startTime: b.startTime,
        endTime: b.endTime,
      })),
    });
  }

  // Calculate PeriodSlots based on start/end times and period duration, excluding break windows
  await prisma.periodSlot.deleteMany({ where: { academicYearId: academicYear.id } });

  const startMin = timeToMinutes(input.startTime);
  const endMin = timeToMinutes(input.endTime);
  const duration = input.periodDurationMinutes;

  const breakWindows = (input.breaks || []).map((b) => ({
    start: timeToMinutes(b.startTime),
    end: timeToMinutes(b.endTime),
  }));

  let currentMin = startMin;
  let periodNum = 1;
  const periodSlotsToCreate: { periodNumber: number; startTime: string; endTime: string; academicYearId: string }[] = [];

  while (currentMin + duration <= endMin) {
    const slotEnd = currentMin + duration;

    // Check if slot overlaps with any break window
    const overlapsBreak = breakWindows.some(
      (b) => Math.max(currentMin, b.start) < Math.min(slotEnd, b.end)
    );

    if (overlapsBreak) {
      const breakObj = breakWindows.find(
        (b) => Math.max(currentMin, b.start) < Math.min(slotEnd, b.end)
      );
      if (breakObj) {
        currentMin = breakObj.end;
      } else {
        currentMin += duration;
      }
      continue;
    }

    periodSlotsToCreate.push({
      periodNumber: periodNum++,
      startTime: minutesToTime(currentMin),
      endTime: minutesToTime(slotEnd),
      academicYearId: academicYear.id,
    });

    currentMin = slotEnd;
  }

  if (periodSlotsToCreate.length > 0) {
    await prisma.periodSlot.createMany({ data: periodSlotsToCreate });
  }

  revalidatePath('/school/setup');
  revalidatePath('/school');
  return { success: true, count: periodSlotsToCreate.length };
}

export async function addClassWithSections(schoolId: string, rawInput: ClassSectionInput) {
  const activeSchoolId = schoolId || (await getAuthenticatedSchoolId());
  const input = classSectionSchema.parse(rawInput);

  // Default to a single section with the class name if no arms provided
  const arms = input.sectionNames && input.sectionNames.length > 0 
    ? input.sectionNames 
    : [input.className];

  const newClass = await prisma.class.create({
    data: {
      schoolId: activeSchoolId,
      name: input.className,
      subsystem: input.subsystem,
      sections: {
        create: arms.map((arm) => {
          const trimmedArm = arm.trim();
          if (
            arms.length === 1 && 
            (trimmedArm.toLowerCase() === input.className.toLowerCase() || trimmedArm === '')
          ) {
            return { name: input.className };
          }
          return { name: `${input.className} ${trimmedArm}` };
        }),
      },
    },
    include: { sections: true },
  });

  revalidatePath('/school/classes');
  revalidatePath('/school/assignments');
  return { success: true, newClass };
}

export async function deleteClass(classId: string) {
  await prisma.class.delete({ where: { id: classId } });
  revalidatePath('/school/classes');
  revalidatePath('/school/assignments');
  return { success: true };
}

export async function createSubject(schoolId: string, rawInput: SubjectInput) {
  const activeSchoolId = schoolId || (await getAuthenticatedSchoolId());
  const input = subjectSchema.parse(rawInput);
  const subject = await prisma.subject.create({
    data: {
      schoolId: activeSchoolId,
      name: input.name,
      code: input.code,
      isLabRequired: input.isLabRequired,
    },
  });
  revalidatePath('/school/subjects-rooms');
  revalidatePath('/school/assignments');
  return { success: true, subject };
}

export async function deleteSubject(subjectId: string) {
  await prisma.subject.delete({ where: { id: subjectId } });
  revalidatePath('/school/subjects-rooms');
  revalidatePath('/school/assignments');
  return { success: true };
}

export async function createRoom(schoolId: string, rawInput: RoomInput) {
  const activeSchoolId = schoolId || (await getAuthenticatedSchoolId());
  const input = roomSchema.parse(rawInput);
  const room = await prisma.room.create({
    data: {
      schoolId: activeSchoolId,
      name: input.name,
      capacity: input.capacity,
      isLab: input.isLab,
    },
  });
  revalidatePath('/school/subjects-rooms');
  return { success: true, room };
}

export async function deleteRoom(roomId: string) {
  await prisma.room.delete({ where: { id: roomId } });
  revalidatePath('/school/subjects-rooms');
  return { success: true };
}

export async function createTeacher(schoolId: string, rawInput: TeacherInput) {
  const activeSchoolId = schoolId || (await getAuthenticatedSchoolId());
  const input = teacherSchema.parse(rawInput);

  const teacher = await prisma.teacher.create({
    data: {
      schoolId: activeSchoolId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      maxPerDay: input.maxPerDay,
      availability: {
        create: [
          DayOfWeek.MONDAY,
          DayOfWeek.TUESDAY,
          DayOfWeek.WEDNESDAY,
          DayOfWeek.THURSDAY,
          DayOfWeek.FRIDAY,
          DayOfWeek.SATURDAY,
        ].map((day) => ({
          day,
          isAvailable: true,
        })),
      },
    },
    include: { availability: true },
  });

  revalidatePath('/school/teachers');
  revalidatePath('/school/assignments');
  return { success: true, teacher };
}

export async function updateTeacherAvailability(
  teacherId: string,
  availabilityMap: Record<string, boolean>
) {
  for (const [dayStr, isAvailable] of Object.entries(availabilityMap)) {
    const day = dayStr as DayOfWeek;
    const existing = await prisma.teacherAvailability.findFirst({
      where: { teacherId, day },
    });

    if (existing) {
      await prisma.teacherAvailability.update({
        where: { id: existing.id },
        data: { isAvailable },
      });
    } else {
      await prisma.teacherAvailability.create({
        data: { teacherId, day, isAvailable },
      });
    }
  }

  revalidatePath('/school/teachers');
  return { success: true };
}

export async function deleteTeacher(teacherId: string) {
  await prisma.teacher.delete({ where: { id: teacherId } });
  revalidatePath('/school/teachers');
  revalidatePath('/school/assignments');
  return { success: true };
}

export async function createTeachingAssignment(
  schoolId: string,
  rawInput: TeachingAssignmentInput
) {
  const activeSchoolId = schoolId || (await getAuthenticatedSchoolId());
  const input = teachingAssignmentSchema.parse(rawInput);

  const assignment = await prisma.teachingAssignment.create({
    data: {
      schoolId: activeSchoolId,
      teacherId: input.teacherId,
      classSectionId: input.classSectionId,
      subjectId: input.subjectId,
      periodsPerWeek: input.periodsPerWeek,
      allowDoublePeriod: input.allowDoublePeriod,
      timePreference: input.timePreference as TimePreference,
    },
    include: {
      teacher: true,
      classSection: true,
      subject: true,
    },
  });

  revalidatePath('/school/assignments');
  return { success: true, assignment };
}

export async function deleteTeachingAssignment(assignmentId: string) {
  await prisma.teachingAssignment.delete({ where: { id: assignmentId } });
  revalidatePath('/school/assignments');
  return { success: true };
}

export async function getSchoolDataPreValidation(targetSchoolId?: string) {
  const schoolId = targetSchoolId || (await getAuthenticatedSchoolId());

  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
    include: {
      days: true,
      periods: true,
    },
  });

  const sections = await prisma.classSection.findMany({
    where: { class: { schoolId } },
  });

  const assignments = await prisma.teachingAssignment.findMany({
    where: { schoolId },
    include: {
      teacher: true,
      classSection: true,
      subject: true,
    },
  });

  const numDays = academicYear?.days.length || 5;
  const numPeriodsPerDay = academicYear?.periods.length || 7;
  const slotsPerClassPerWeek = numDays * numPeriodsPerDay;

  const totalClassSections = sections.length;
  const totalAvailableSlotCapacity = totalClassSections * slotsPerClassPerWeek;

  const totalAssignedPeriods = assignments.reduce(
    (sum, a) => sum + a.periodsPerWeek,
    0
  );

  const warnings: string[] = [];

  if (totalAvailableSlotCapacity > 0 && totalAssignedPeriods > totalAvailableSlotCapacity) {
    warnings.push(
      `⚠️ CAPACITY EXCEEDED — Required periods (${totalAssignedPeriods}) exceed total class section slot capacity (${totalAvailableSlotCapacity}).`
    );
  }

  // Check section over-allocation
  const sectionPeriodsMap: Record<string, { name: string; periods: number }> = {};
  for (const a of assignments) {
    if (!sectionPeriodsMap[a.classSectionId]) {
      sectionPeriodsMap[a.classSectionId] = {
        name: a.classSection.name,
        periods: 0,
      };
    }
    sectionPeriodsMap[a.classSectionId].periods += a.periodsPerWeek;
  }

  for (const sId in sectionPeriodsMap) {
    const sInfo = sectionPeriodsMap[sId];
    if (sInfo.periods > slotsPerClassPerWeek && slotsPerClassPerWeek > 0) {
      warnings.push(
        `Section "${sInfo.name}" requires ${sInfo.periods} periods/week, which exceeds the max ${slotsPerClassPerWeek} available weekly slots.`
      );
    }
  }

  const isValid = warnings.length === 0 && totalAssignedPeriods > 0;

  return {
    isValid,
    totalClassSections,
    totalAvailableSlotCapacity,
    totalAssignedPeriods,
    numDays,
    numPeriodsPerDay,
    slotsPerClassPerWeek,
    warnings,
  };
}

export async function getSchoolMasterData(targetSchoolId?: string) {
  const schoolId = targetSchoolId || (await getAuthenticatedSchoolId());

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
    include: {
      days: true,
      periods: { orderBy: { periodNumber: 'asc' } },
      breaks: { orderBy: { startTime: 'asc' } },
    },
  });

  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: { sections: true },
    orderBy: { name: 'asc' },
  });

  const subjects = await prisma.subject.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' },
  });

  const rooms = await prisma.room.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' },
  });

  const teachers = await prisma.teacher.findMany({
    where: { schoolId },
    include: { availability: true },
    orderBy: { name: 'asc' },
  });

  const assignments = await prisma.teachingAssignment.findMany({
    where: { schoolId },
    include: {
      teacher: true,
      classSection: true,
      subject: true,
    },
    orderBy: { id: 'desc' },
  });

  return {
    school,
    academicYear,
    classes,
    subjects,
    rooms,
    teachers,
    assignments,
  };
}
