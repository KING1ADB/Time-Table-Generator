export interface ConflictCheckResult {
  isValid: boolean;
  conflicts: string[];
}

export function validateSlotMove(
  allEntries: any[],
  currentEntry: any,
  targetDay: string,
  targetPeriodSlotId: string,
  targetRoomId?: string | null
): ConflictCheckResult {
  const conflicts: string[] = [];

  if (!currentEntry || !currentEntry.teachingAssignment) {
    return { isValid: true, conflicts: [] };
  }

  const teacherId = currentEntry.teachingAssignment.teacherId;
  const teacherName = currentEntry.teachingAssignment.teacher?.name || 'Teacher';
  const classSectionId = currentEntry.classSectionId;
  const className = currentEntry.classSection?.name || 'Class';

  // 1. Teacher Double-Booking Check
  const teacherConflict = allEntries.find(
    (e) =>
      e.id !== currentEntry.id &&
      e.day === targetDay &&
      e.periodSlotId === targetPeriodSlotId &&
      e.teachingAssignment?.teacherId === teacherId
  );

  if (teacherConflict) {
    conflicts.push(
      `Teacher "${teacherName}" is already teaching "${teacherConflict.classSection?.name || 'another class'}" (${teacherConflict.teachingAssignment?.subject?.name || 'Subject'}) on ${targetDay}.`
    );
  }

  // 2. Class Section Double-Booking Check
  const classConflict = allEntries.find(
    (e) =>
      e.id !== currentEntry.id &&
      e.day === targetDay &&
      e.periodSlotId === targetPeriodSlotId &&
      e.classSectionId === classSectionId
  );

  if (classConflict) {
    conflicts.push(
      `Class "${className}" already has "${classConflict.teachingAssignment?.subject?.name || 'a lesson'}" scheduled on ${targetDay}.`
    );
  }

  // 3. Room Double-Booking Check
  if (targetRoomId) {
    const roomConflict = allEntries.find(
      (e) =>
        e.id !== currentEntry.id &&
        e.day === targetDay &&
        e.periodSlotId === targetPeriodSlotId &&
        e.roomId === targetRoomId
    );

    if (roomConflict) {
      conflicts.push(
        `Room is already occupied by "${roomConflict.classSection?.name || 'Class'}" (${roomConflict.teachingAssignment?.subject?.name || 'Subject'}).`
      );
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
  };
}
