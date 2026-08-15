import time
from ortools.sat.python import cp_model
from models import (
    TimetableGenerationRequest,
    TimetableGenerationResponse,
    TimetableEntryOutput,
    TimePreference,
)


def solve_timetable(request: TimetableGenerationRequest) -> TimetableGenerationResponse:
    start_time = time.time()
    model = cp_model.CpModel()

    days = request.days
    period_slots = request.periodSlots
    classes = request.classSectionIds
    assignments = request.assignments
    rooms = request.rooms
    teachers_dict = {t.teacherId: t for t in request.teachers}

    # Index maps
    assignment_dict = {a.id: a for a in assignments}
    lab_rooms = [r.id for r in rooms if r.isLab]
    general_rooms = [r.id for r in rooms if not r.isLab]
    all_room_ids = [r.id for r in rooms]

    # Map locked entries for quick lookup: (classId, day, periodId) -> assignmentId
    locked_map = {}
    for lock in request.lockedEntries:
        locked_map[(lock.classSectionId, lock.day, lock.periodSlotId)] = lock

    # Variables: x[assignment_id, day, period_id, room_id] = 1 if scheduled
    x = {}
    for a in assignments:
        for d in days:
            for p in period_slots:
                # Filter valid rooms for lab requirements
                valid_rooms = lab_rooms if a.isLabRequired else (all_room_ids if all_room_ids else [None])
                for r_id in (valid_rooms or [None]):
                    x[(a.id, d, p.id, r_id)] = model.NewBoolVar(f"x_{a.id}_{d}_{p.id}_{r_id}")

    # -------------------------------------------------------------
    # HARD CONSTRAINT 1: Workload Fulfillment & Locked Preservation
    # -------------------------------------------------------------
    for a in assignments:
        a_vars = [
            x[(a.id, d, p.id, r_id)]
            for d in days
            for p in period_slots
            for r_id in (lab_rooms if a.isLabRequired else (all_room_ids or [None]))
        ]
        model.Add(sum(a_vars) == a.periodsPerWeek)

    # Enforce Locked Entries (🔒)
    for lock in request.lockedEntries:
        a_id = lock.teachingAssignmentId
        d = lock.day
        p_id = lock.periodSlotId
        r_id = lock.roomId
        if (a_id, d, p_id, r_id) in x:
            model.Add(x[(a_id, d, p_id, r_id)] == 1)

    # -------------------------------------------------------------
    # HARD CONSTRAINT 2: Class Section No-Overlap
    # (A class section can have at most 1 lesson per (day, period))
    # -------------------------------------------------------------
    for c_id in classes:
        c_assignments = [a for a in assignments if a.classSectionId == c_id]
        for d in days:
            for p in period_slots:
                slot_vars = []
                for a in c_assignments:
                    for r_id in (lab_rooms if a.isLabRequired else (all_room_ids or [None])):
                        if (a.id, d, p.id, r_id) in x:
                            slot_vars.append(x[(a.id, d, p.id, r_id)])
                model.Add(sum(slot_vars) <= 1)

    # -------------------------------------------------------------
    # HARD CONSTRAINT 3: Teacher No-Overlap & Availability
    # -------------------------------------------------------------
    for t_id, t_info in teachers_dict.items():
        t_assignments = [a for a in assignments if a.teacherId == t_id]

        # Unavailable slots
        unavail_set = {(u["day"], u["periodSlotId"]) for u in t_info.unavailableSlots}
        for d in days:
            # Max daily limit
            daily_vars = []
            for p in period_slots:
                slot_vars = []
                for a in t_assignments:
                    for r_id in (lab_rooms if a.isLabRequired else (all_room_ids or [None])):
                        if (a.id, d, p.id, r_id) in x:
                            slot_vars.append(x[(a.id, d, p.id, r_id)])

                # Check availability
                if (d, p.id) in unavail_set:
                    model.Add(sum(slot_vars) == 0)
                model.Add(sum(slot_vars) <= 1)
                daily_vars.extend(slot_vars)
            model.Add(sum(daily_vars) <= t_info.maxPerDay)

    # -------------------------------------------------------------
    # HARD CONSTRAINT 4: Room No-Overlap
    # -------------------------------------------------------------
    for r_id in all_room_ids:
        for d in days:
            for p in period_slots:
                room_vars = [x[(a.id, d, p.id, r_id)] for a in assignments if (a.id, d, p.id, r_id) in x]
                model.Add(sum(room_vars) <= 1)

    # -------------------------------------------------------------
    # SOFT CONSTRAINTS / OPTIMIZATION OBJECTIVE
    # -------------------------------------------------------------
    objective_terms = []
    # Priority for Morning slots (Period 1 to 4) for MORNING preference
    for a in assignments:
        if a.timePreference == TimePreference.MORNING:
            for d in days:
                for p in period_slots[:4]:  # Early periods
                    for r_id in (lab_rooms if a.isLabRequired else (all_room_ids or [None])):
                        if (a.id, d, p.id, r_id) in x:
                            objective_terms.append(x[(a.id, d, p.id, r_id)] * 10)

    if objective_terms:
        model.Maximize(sum(objective_terms))

    # Solver configuration
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0  # 10s max solver timeout
    status = solver.Solve(model)

    exec_time = round((time.time() - start_time) * 1000, 2)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        entries = []
        for (a_id, d, p_id, r_id), var in x.items():
            if solver.Value(var) == 1:
                a = assignment_dict[a_id]
                is_lock = (a.classSectionId, d, p_id) in locked_map
                entries.append(
                    TimetableEntryOutput(
                        day=d,
                        periodSlotId=p_id,
                        classSectionId=a.classSectionId,
                        teachingAssignmentId=a_id,
                        roomId=r_id if r_id is not None else None,
                        isLocked=is_lock,
                    )
                )
        return TimetableGenerationResponse(
            status="SUCCESS", executionTimeMs=exec_time, timetableEntries=entries
        )
    else:
        return TimetableGenerationResponse(
            status="INFEASIBLE",
            executionTimeMs=exec_time,
            diagnostics=[
                "Constraints cannot be satisfied. Check teacher availability or period capacity."
            ],
        )
