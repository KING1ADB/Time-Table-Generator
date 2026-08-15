"""
Quick local integration test for solver and models.
"""
from models import (
    TimetableGenerationRequest,
    DayOfWeek,
    TimePreference,
    PeriodSlotInput,
    TeacherAvailabilityInput,
    RoomInput,
    TeachingAssignmentInput,
)
from solver import solve_timetable


def test_solver_direct():
    req = TimetableGenerationRequest(
        schoolId="school_mboa_college_01",
        academicYearId="year_2026",
        days=[DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY],
        periodSlots=[
            PeriodSlotInput(id="p1", periodNumber=1, startTime="07:30", endTime="08:20"),
            PeriodSlotInput(id="p2", periodNumber=2, startTime="08:20", endTime="09:10"),
            PeriodSlotInput(id="p3", periodNumber=3, startTime="09:10", endTime="10:00"),
            PeriodSlotInput(id="p4", periodNumber=4, startTime="10:20", endTime="11:10"),
            PeriodSlotInput(id="p5", periodNumber=5, startTime="11:10", endTime="12:00"),
        ],
        classSectionIds=["class_form_5a", "class_form_5b"],
        teachers=[
            TeacherAvailabilityInput(teacherId="t1", unavailableSlots=[], maxPerDay=5),
            TeacherAvailabilityInput(teacherId="t2", unavailableSlots=[], maxPerDay=5),
        ],
        rooms=[
            RoomInput(id="r1", name="Room 101", isLab=False, capacity=50),
            RoomInput(id="r2", name="Science Lab", isLab=True, capacity=40),
        ],
        assignments=[
            TeachingAssignmentInput(
                id="a1",
                teacherId="t1",
                classSectionId="class_form_5a",
                subjectId="math",
                periodsPerWeek=5,
                allowDoublePeriod=True,
                timePreference=TimePreference.MORNING,
                isLabRequired=False,
            ),
            TeachingAssignmentInput(
                id="a2",
                teacherId="t2",
                classSectionId="class_form_5a",
                subjectId="biology",
                periodsPerWeek=3,
                allowDoublePeriod=False,
                timePreference=TimePreference.ANY,
                isLabRequired=True,
            ),
        ],
        lockedEntries=[],
    )

    resp = solve_timetable(req)
    print("Solver Test Status:", resp.status)
    print("Execution Time (ms):", resp.executionTimeMs)
    print("Entries generated:", len(resp.timetableEntries))
    for entry in resp.timetableEntries:
        print(f"  Day: {entry.day}, Period: {entry.periodSlotId}, Class: {entry.classSectionId}, Assignment: {entry.teachingAssignmentId}, Room: {entry.roomId}")

    assert resp.status == "SUCCESS"
    assert len(resp.timetableEntries) == 8  # 5 periods math + 3 periods biology
    print("ALL TESTS PASSED!")


if __name__ == "__main__":
    test_solver_direct()
