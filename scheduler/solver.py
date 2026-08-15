import time
from ortools.sat.python import cp_model
from models import (
    TimetableGenerationRequest,
    TimetableGenerationResponse,
    TimetableEntryOutput,
    TimePreference,
)


def analyze_infeasibility_reasons(request: TimetableGenerationRequest) -> list[str]:
    diagnostics = []

    days = request.days
    period_slots = request.periodSlots
    total_weekly_slots = len(days) * len(period_slots)

    # 1. Check Lab Requirements vs Available Lab Rooms
    lab_rooms = [r for r in request.rooms if r.isLab]
    lab_subjects_needed = [a for a in request.assignments if a.isLabRequired]
    if lab_subjects_needed and not lab_rooms:
        diagnostics.append(
            f"❌ LAB ROOM MISSING: {len(lab_subjects_needed)} assignment(s) require a Laboratory (e.g. Science/Computer Lab), but 0 rooms are marked as 'Laboratory' in Subjects & Rooms."
        )

    # 2. Check Class Slot Capacity vs Assigned Periods
    class_assignments = {}
    for a in request.assignments:
        class_assignments[a.classSectionId] = class_assignments.get(a.classSectionId, 0) + a.periodsPerWeek

    for c_id, total_periods in class_assignments.items():
        if total_periods > total_weekly_slots:
            diagnostics.append(
                f"❌ CLASS CAPACITY EXCEEDED: Class Section ID '{c_id}' requires {total_periods} periods/week, but your schedule only has {total_weekly_slots} total weekly slots ({len(days)} days × {len(period_slots)} periods)."
            )

    # 3. Check Teacher Workload vs Total Weekly Slots & Daily Max
    teachers_dict = {t.teacherId: t for t in request.teachers}
    teacher_periods = {}
    for a in request.assignments:
        teacher_periods[a.teacherId] = teacher_periods.get(a.teacherId, 0) + a.periodsPerWeek

    for t_id, total_periods in teacher_periods.items():
        t_info = teachers_dict.get(t_id)
        max_daily = t_info.maxPerDay if t_info else len(period_slots)
        
        # Calculate available days for teacher
        unavail_days = set()
        if t_info:
            for u in t_info.unavailableSlots:
                if not u.get("periodSlotId"):
                    unavail_days.add(u.get("day"))

        available_days_count = max(1, len(days) - len(unavail_days))
        max_possible_periods = available_days_count * max_daily

        if total_periods > total_weekly_slots:
            diagnostics.append(
                f"❌ TEACHER OVERLOAD: Teacher ID '{t_id}' is assigned {total_periods} periods/week across all classes, but the week only has {total_weekly_slots} total period slots."
            )
        elif total_periods > max_possible_periods:
            diagnostics.append(
                f"❌ TEACHER DAILY CAP EXCEEDED: Teacher ID '{t_id}' requires {total_periods} periods/week, but with maxPerDay={max_daily} across {available_days_count} available day(s), they can only teach at most {max_possible_periods} periods."
            )

    if not diagnostics:
        diagnostics.append(
            "Constraints conflict. Ensure teachers have sufficient availability and daily lesson limits match required weekly periods."
        )

    return diagnostics


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

    # Map locked entries for quick lookup: (classId, day, periodId) -> lock
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
            if (a.id, d, p.id, r_id) in x
        ]
        if a_vars:
            model.Add(sum(a_vars) == a.periodsPerWeek)
        else:
            # Cannot fulfill assignment due to missing room/variable
            exec_time = round((time.time() - start_time) * 1000, 2)
            return TimetableGenerationResponse(
                status="INFEASIBLE",
                executionTimeMs=exec_time,
                diagnostics=analyze_infeasibility_reasons(request),
            )

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
                if slot_vars:
                    model.Add(sum(slot_vars) <= 1)

    # -------------------------------------------------------------
    # HARD CONSTRAINT 3: Teacher No-Overlap & Availability
    # -------------------------------------------------------------
    for t_id, t_info in teachers_dict.items():
        t_assignments = [a for a in assignments if a.teacherId == t_id]

        # Unavailable slots map
        unavail_days = {u["day"] for u in t_info.unavailableSlots if not u.get("periodSlotId")}
        unavail_slots = {(u["day"], u["periodSlotId"]) for u in t_info.unavailableSlots if u.get("periodSlotId")}

        for d in days:
            daily_vars = []
            for p in period_slots:
                slot_vars = []
                for a in t_assignments:
                    for r_id in (lab_rooms if a.isLabRequired else (all_room_ids or [None])):
                        if (a.id, d, p.id, r_id) in x:
                            slot_vars.append(x[(a.id, d, p.id, r_id)])

                # Check day-level or slot-level unavailability
                if d in unavail_days or (d, p.id) in unavail_slots:
                    if slot_vars:
                        model.Add(sum(slot_vars) == 0)
                
                if slot_vars:
                    model.Add(sum(slot_vars) <= 1)
                    daily_vars.extend(slot_vars)

            if daily_vars:
                model.Add(sum(daily_vars) <= t_info.maxPerDay)

    # -------------------------------------------------------------
    # HARD CONSTRAINT 4: Room No-Overlap
    # -------------------------------------------------------------
    for r_id in all_room_ids:
        if r_id is None:
            continue
        for d in days:
            for p in period_slots:
                room_vars = [x[(a.id, d, p.id, r_id)] for a in assignments if (a.id, d, p.id, r_id) in x]
                if room_vars:
                    model.Add(sum(room_vars) <= 1)

    # -------------------------------------------------------------
    # SOFT CONSTRAINTS / OPTIMIZATION OBJECTIVE
    # -------------------------------------------------------------
    objective_terms = []
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
    solver.parameters.max_time_in_seconds = 10.0
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
            diagnostics=analyze_infeasibility_reasons(request),
        )
