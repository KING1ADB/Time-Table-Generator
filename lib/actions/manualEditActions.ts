'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { validateSlotMove } from '@/lib/timetable/conflictEngine';

export async function moveOrSwapEntryAction(
  schoolId: string,
  sourceEntryId: string,
  targetDay: any,
  targetPeriodSlotId: string,
  targetRoomId?: string | null
) {
  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  if (!academicYear) {
    return { success: false, error: 'Active academic year not found.' };
  }

  const timetable = await prisma.timetable.findFirst({
    where: { schoolId, academicYearId: academicYear.id },
    include: {
      entries: {
        include: {
          classSection: true,
          teachingAssignment: { include: { teacher: true, subject: true } },
          room: true,
        },
      },
    },
  });

  if (!timetable) {
    return { success: false, error: 'No active timetable found.' };
  }

  const sourceEntry = timetable.entries.find((e) => e.id === sourceEntryId);

  if (!sourceEntry) {
    return { success: false, error: 'Source timetable entry not found.' };
  }

  if (sourceEntry.isLocked) {
    return {
      success: false,
      error: 'Cannot move a locked entry (🔒). Unlock it first.',
    };
  }

  // Execute Conflict Diagnostics
  const conflictResult = validateSlotMove(
    timetable.entries,
    sourceEntry,
    targetDay,
    targetPeriodSlotId,
    targetRoomId !== undefined ? targetRoomId : sourceEntry.roomId
  );

  if (!conflictResult.isValid) {
    return {
      success: false,
      error: 'Conflict detected. Move aborted.',
      conflicts: conflictResult.conflicts,
    };
  }

  // Target Slot Check (Handle Swap vs Move)
  const targetEntry = timetable.entries.find(
    (e) =>
      e.classSectionId === sourceEntry.classSectionId &&
      e.day === targetDay &&
      e.periodSlotId === targetPeriodSlotId
  );

  if (targetEntry) {
    if (targetEntry.isLocked) {
      return {
        success: false,
        error: 'Target slot contains a locked entry (🔒).',
      };
    }

    // Swap positions
    await prisma.$transaction([
      prisma.timetableEntry.update({
        where: { id: sourceEntryId },
        data: {
          day: targetDay,
          periodSlotId: targetPeriodSlotId,
          roomId: targetRoomId !== undefined ? targetRoomId : sourceEntry.roomId,
        },
      }),
      prisma.timetableEntry.update({
        where: { id: targetEntry.id },
        data: {
          day: sourceEntry.day,
          periodSlotId: sourceEntry.periodSlotId,
          roomId: sourceEntry.roomId,
        },
      }),
    ]);
  } else {
    // Single slot move
    await prisma.timetableEntry.update({
      where: { id: sourceEntryId },
      data: {
        day: targetDay,
        periodSlotId: targetPeriodSlotId,
        roomId: targetRoomId !== undefined ? targetRoomId : sourceEntry.roomId,
      },
    });
  }

  revalidatePath('/school/timetable');
  return { success: true };
}

export async function toggleEntryLockAction(entryId: string, isLocked: boolean) {
  const updated = await prisma.timetableEntry.update({
    where: { id: entryId },
    data: { isLocked },
  });

  revalidatePath('/school/timetable');
  return { success: true, isLocked: updated.isLocked };
}

export async function updateEntryRoomAction(entryId: string, roomId: string | null) {
  await prisma.timetableEntry.update({
    where: { id: entryId },
    data: { roomId },
  });

  revalidatePath('/school/timetable');
  return { success: true };
}
