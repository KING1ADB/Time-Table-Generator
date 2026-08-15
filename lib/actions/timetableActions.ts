'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedSchoolId } from '@/lib/auth/tenantGuard';

const SCHEDULER_URL = process.env.SCHEDULER_ENGINE_URL || 'http://localhost:8000';

export async function generateTimetableAction(targetSchoolId?: string) {
  const schoolId = targetSchoolId || (await getAuthenticatedSchoolId());

  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
    include: { days: true, periods: { orderBy: { periodNumber: 'asc' } }, breaks: true },
  });

  if (!academicYear || academicYear.days.length === 0 || academicYear.periods.length === 0) {
    return {
      success: false,
      error: 'School operating schedule is not configured. Complete setup first.',
    };
  }

  const classSections = await prisma.classSection.findMany({
    where: { class: { schoolId } },
  });

  const teachers = await prisma.teacher.findMany({
    where: { schoolId },
    include: { availability: true },
  });

  const rooms = await prisma.room.findMany({ where: { schoolId } });

  const assignments = await prisma.teachingAssignment.findMany({
    where: { schoolId },
    include: { subject: true },
  });

  // Fetch existing locks (🔒)
  const existingTimetable = await prisma.timetable.findFirst({
    where: { schoolId, academicYearId: academicYear.id },
    include: { entries: { where: { isLocked: true } } },
  });

  const lockedEntries = (existingTimetable?.entries || []).map((e) => ({
    classSectionId: e.classSectionId,
    day: e.day,
    periodSlotId: e.periodSlotId,
    teachingAssignmentId: e.teachingAssignmentId,
    roomId: e.roomId || undefined,
  }));

  // Build Python Engine Payload
  const payload = {
    schoolId,
    academicYearId: academicYear.id,
    days: academicYear.days.map((d) => d.day),
    periodSlots: academicYear.periods.map((p) => ({
      id: p.id,
      periodNumber: p.periodNumber,
      startTime: p.startTime,
      endTime: p.endTime,
    })),
    classSectionIds: classSections.map((c) => c.id),
    teachers: teachers.map((t) => ({
      teacherId: t.id,
      unavailableSlots: t.availability
        .filter((a) => !a.isAvailable)
        .map((a) => ({ day: a.day, periodSlotId: '' })), // Day-level unavailability
      maxPerDay: t.maxPerDay,
    })),
    rooms: rooms.map((r) => ({
      id: r.id,
      name: r.name,
      isLab: r.isLab,
      capacity: r.capacity,
    })),
    assignments: assignments.map((a) => ({
      id: a.id,
      teacherId: a.teacherId,
      classSectionId: a.classSectionId,
      subjectId: a.subjectId,
      periodsPerWeek: a.periodsPerWeek,
      allowDoublePeriod: a.allowDoublePeriod,
      timePreference: a.timePreference,
      isLabRequired: a.subject.isLabRequired,
    })),
    lockedEntries,
  };

  try {
    const res = await fetch(`${SCHEDULER_URL}/api/v1/generate-timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Scheduler microservice returned status ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== 'SUCCESS') {
      return {
        success: false,
        error: 'Timetable generation infeasible with current constraints.',
        diagnostics: data.diagnostics || [],
      };
    }

    // Persist Timetable & Entries in Database
    let timetable = await prisma.timetable.findFirst({
      where: { schoolId, academicYearId: academicYear.id },
    });

    if (!timetable) {
      timetable = await prisma.timetable.create({
        data: {
          name: `Master Timetable ${academicYear.year}`,
          schoolId,
          academicYearId: academicYear.id,
        },
      });
    }

    // Replace unlocked entries while preserving locked entries
    await prisma.$transaction([
      prisma.timetableEntry.deleteMany({
        where: { timetableId: timetable.id, isLocked: false },
      }),
      prisma.timetableEntry.createMany({
        data: data.timetableEntries
          .filter((e: any) => !e.isLocked)
          .map((e: any) => ({
            timetableId: timetable!.id,
            classSectionId: e.classSectionId,
            teachingAssignmentId: e.teachingAssignmentId,
            roomId: e.roomId || null,
            periodSlotId: e.periodSlotId,
            day: e.day,
            isLocked: false,
          })),
      }),
    ]);

    revalidatePath('/school/timetable');
    return {
      success: true,
      executionTimeMs: data.executionTimeMs,
      entriesCount: data.timetableEntries.length,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to connect to scheduler microservice.',
    };
  }
}

export async function getTimetableData(targetSchoolId?: string) {
  const schoolId = targetSchoolId || (await getAuthenticatedSchoolId());

  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
    include: {
      days: true,
      periods: { orderBy: { periodNumber: 'asc' } },
      breaks: { orderBy: { startTime: 'asc' } },
    },
  });

  const classSections = await prisma.classSection.findMany({
    where: { class: { schoolId } },
    include: { class: true },
    orderBy: { name: 'asc' },
  });

  const teachers = await prisma.teacher.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' },
  });

  const rooms = await prisma.room.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' },
  });

  const assignments = await prisma.teachingAssignment.findMany({
    where: { schoolId },
    include: {
      subject: true,
      teacher: true,
      classSection: true,
    },
  });

  const timetable = academicYear
    ? await prisma.timetable.findFirst({
        where: { schoolId, academicYearId: academicYear.id },
        include: {
          entries: {
            include: {
              classSection: true,
              teachingAssignment: {
                include: {
                  subject: true,
                  teacher: true,
                },
              },
              room: true,
              periodSlot: true,
            },
          },
        },
      })
    : null;

  return {
    academicYear,
    classSections,
    teachers,
    rooms,
    assignments,
    timetable,
  };
}

export async function toggleEntryLockAction(entryId: string) {
  const entry = await prisma.timetableEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    return { success: false, error: 'Timetable entry not found' };
  }

  const updated = await prisma.timetableEntry.update({
    where: { id: entryId },
    data: { isLocked: !entry.isLocked },
  });

  revalidatePath('/school/timetable');
  return { success: true, isLocked: updated.isLocked };
}
