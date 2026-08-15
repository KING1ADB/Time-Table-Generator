from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class DayOfWeek(str, Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"


class TimePreference(str, Enum):
    ANY = "ANY"
    MORNING = "MORNING"
    AFTERNOON = "AFTERNOON"


class LockedEntry(BaseModel):
    classSectionId: str
    day: DayOfWeek
    periodSlotId: str
    teachingAssignmentId: str
    roomId: Optional[str] = None


class TeacherAvailabilityInput(BaseModel):
    teacherId: str
    unavailableSlots: List[dict]  # list of {"day": DayOfWeek, "periodSlotId": str}
    maxPerDay: int = 6


class TeachingAssignmentInput(BaseModel):
    id: str
    teacherId: str
    classSectionId: str
    subjectId: str
    periodsPerWeek: int
    allowDoublePeriod: bool = True
    timePreference: TimePreference = TimePreference.ANY
    isLabRequired: bool = False


class RoomInput(BaseModel):
    id: str
    name: str
    isLab: bool = False
    capacity: int = 50


class PeriodSlotInput(BaseModel):
    id: str
    periodNumber: int
    startTime: str
    endTime: str


class TimetableGenerationRequest(BaseModel):
    schoolId: str
    academicYearId: str
    days: List[DayOfWeek]
    periodSlots: List[PeriodSlotInput]
    classSectionIds: List[str]
    teachers: List[TeacherAvailabilityInput]
    rooms: List[RoomInput]
    assignments: List[TeachingAssignmentInput]
    lockedEntries: List[LockedEntry] = []


class TimetableEntryOutput(BaseModel):
    day: DayOfWeek
    periodSlotId: str
    classSectionId: str
    teachingAssignmentId: str
    roomId: Optional[str] = None
    isLocked: bool = False


class TimetableGenerationResponse(BaseModel):
    status: str  # "SUCCESS" or "INFEASIBLE"
    executionTimeMs: float
    timetableEntries: List[TimetableEntryOutput] = []
    diagnostics: List[str] = []
