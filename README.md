# Cameroonian Secondary School Timetable & Automatic Generation System

> **A multi-tenant SaaS scheduling platform tailored specifically for Cameroonian secondary schools (Anglophone & Francophone subsystems), powered by an automated constraint-satisfaction timetable engine with interactive manual editing and lesson locking.**

---

## 🌟 Executive Summary

Traditional timetable construction in Cameroonian secondary schools is complex, time-consuming, and prone to scheduling conflicts. School administrators are often forced to manually fill grid cells line-by-line while balancing dozens of classes, teachers, subjects, special lab requirements, and teacher availability.

This system replaces manual cell-by-cell creation with an **automated constraint-based timetable engine**. Administrators define school operating hours, period durations, break slots, classes/sections, teachers, and teaching assignments (with period requirements). The system automatically computes a conflict-free timetable across the entire institution within seconds, while giving administrators complete freedom to tweak, swap, drag-and-drop, lock, and export high-resolution print-ready PDFs (A3/A2 Landscape).

---

## 🏛️ System Roles & Multi-Tenant Architecture

Designed as a **multi-tenant SaaS platform**, a single deployment can securely serve hundreds of secondary schools across Cameroon.

```
                            SYSTEM
                              │
               ┌──────────────┴──────────────┐
               │                             │
          School A                      School B
             │                             │
        School Admin                  School Admin
             │                             │
     ┌───────┼───────┐             ┌───────┼───────┐
  Teachers Classes Subjects     Teachers Classes Subjects
```

### Roles & Responsibilities

| Role | Primary Responsibilities |
| :--- | :--- |
| **System Admin** | Provision schools, activate/suspend school accounts, create first School Admin, manage SaaS subscriptions, view platform metrics. |
| **School Admin** | Configure school hours/breaks, manage teachers, classes & sections, define teaching assignments, set availability & constraints, run auto-generation engine, manually edit & lock lessons, export/print PDF timetables. |
| **Teacher** *(Roadmap)* | Log in to view personal teaching schedules, track workload, and download individual timetables. |
| **Student / Parent** *(Roadmap)* | View class schedules, subject timetables, room assignments, and mid-term updates. |
| **School Management** *(Roadmap)* | Access workload distribution reports, free-period analytics, and room utilization audits. |

---

## 🔄 System Workflow Lifecycle

The end-to-end operational flow follows a structured 16-step lifecycle:

```
[1] System Admin Creates School & First Admin Account
                      │
                      ▼
[2] School Admin Logs In & Configures School Info & Academic Year
                      │
                      ▼
[3] Setup Operating Hours, Period Durations & Break Schedules
                      │
                      ▼
[4] Create Classes (Form 1–5, Lower/Upper Sixth) & Sections (A, B, C)
                      │
                      ▼
[5] Create Subjects & Rooms (Classrooms, Labs, Computer Rooms)
                      │
                      ▼
[6] Register Teachers (Single global profile per educator)
                      │
                      ▼
[7] Define Teaching Assignments (Teacher + Class + Subject + Periods/Week)
                      │
                      ▼
[8] Specify Teacher Availability & Special Constraints (Consecutive limits, Morning preference)
                      │
                      ▼
[9] Data Pre-Validation Check (Verify total required periods ≤ available period slots)
                      │
                      ▼
[10] Execute Automatic Timetable Generation Engine (Constraint Solver)
                      │
                      ▼
[11] System Generates Conflict-Free Timetable Preview
                      │
                      ▼
[12] School Admin Reviews Timetable (Class, Teacher & Master Views)
                      │
                      ▼
[13] Manual Fine-Tuning (Drag & drop, swap, replace teacher/room with live conflict check)
                      │
                      ▼
[14] Lock Key Lessons (🔒) to Prevent Overwriting
                      │
                      ▼
[15] Optional Regeneration (Engine recalculates unlocked slots while preserving locked lessons)
                      │
                      ▼
[16] Final Approval & PDF Export (A3 / A2 Landscape for Notice Boards & Offices)
```

---

## ✨ Key System Features & Core Functionality

### 1. School Setup & Time Slot Engine

When configuring a school for an academic year, the administrator specifies operating parameters:

- **School Information**: Name (e.g., *Mboa College*), Academic Year (e.g., *2026/2027*), Campus/Location, School Type (Grammar, Technical, Bilingual).
- **Working Days**: Monday through Friday (with optional Saturday support).
- **Daily Operating Hours**: e.g., `7:30 AM` → `5:00 PM`.
- **Flexible Period Duration**: Choose standard options (`45 min`, `50 min`, `55 min`, `60 min`) or enter a custom duration.
- **Interleaved Break & Lunch Management**: Explicitly separate teaching periods from non-academic breaks so lessons are never assigned during break/lunch slots.

#### Example Period Schedule (55 min Periods with Breaks)
| Time Slot | Type | Description |
| :--- | :--- | :--- |
| `07:30 – 08:25` | **Period 1** | Teaching Slot |
| `08:25 – 09:20` | **Period 2** | Teaching Slot |
| `09:20 – 09:40` | ☕ **Break** | Morning Recess (No lessons allowed) |
| `09:40 – 10:35` | **Period 3** | Teaching Slot |
| `10:35 – 11:30` | **Period 4** | Teaching Slot |
| `11:30 – 12:30` | 🍱 **Lunch** | Mid-day Break (No lessons allowed) |
| `12:30 – 01:25` | **Period 5** | Teaching Slot |
| `01:25 – 02:20` | **Period 6** | Teaching Slot |
| `02:20 – 03:15` | **Period 7** | Teaching Slot |

---

### 2. Cameroonian Secondary School Structure (Classes & Streams)

Full support for the Cameroonian secondary education hierarchy across general, technical, and bilingual subsystems:

- **Lower Secondary (O-Level)**: Form 1, Form 2, Form 3, Form 4, Form 5
- **Upper Secondary / High School (A-Level)**:
  - Lower Sixth Arts / Lower Sixth Science
  - Upper Sixth Arts / Upper Sixth Science
- **Multi-Stream / Section Support**: For large schools with multiple arms per level (e.g., `Form 5A`, `Form 5B`, `Form 5C`).

---

### 3. Decoupled Teaching Assignments (Decoupling Content from Timing)

Instead of forcing administrators to assign day and time during data entry, the system decouples **what needs to be taught** from **when it will be taught**.

A teacher is created once in the global registry, then associated with multiple **Teaching Assignments**:

```
                  Teacher (e.g., Briyand)
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
Assignment 1           Assignment 2           Assignment 3
Class: Upper 6 Sci     Class: Lower 6 Sci     Class: Form 5A
Subject: Comp Sci      Subject: Comp Sci      Subject: Mathematics
Periods/Wk: 4          Periods/Wk: 3          Periods/Wk: 5
```

#### Example Assignments Input Data

| Teacher | Class | Subject | Required Periods / Week | Constraints / Preferences |
| :--- | :--- | :--- | :---: | :--- |
| **Briyand** | Upper Sixth Science | Computer Science | **4** | Double periods allowed, Morning preferred |
| **Briyand** | Lower Sixth Science | Computer Science | **3** | Single periods |
| **Briyand** | Form 5A | Mathematics | **5** | Double period allowed |
| **Briyand** | Form 5B | Mathematics | **4** | Single periods |
| **John** | Upper Sixth Science | Mathematics | **5** | Morning preferred |
| **Paul** | Upper Sixth Science | Physics | **4** | Require Lab Room |

---

### 4. Automatic Conflict-Free Timetable Generation Engine

The core scheduling engine operates as a **Constraint Satisfaction Problem (CSP)** solver. It ingests all teaching assignments, class schedules, room allocations, and availability matrices, then automatically generates a balanced schedule.

#### Hard Constraints (Enforced 100% - Zero Violations)
1. **Teacher Conflict Prevention**: A teacher cannot be scheduled to teach two different classes at the same time.
2. **Class Conflict Prevention**: A class/section cannot be scheduled for two different subjects at the same time.
3. **Room / Lab Conflict Prevention**: A specialized facility (e.g., Computer Lab, Chemistry Lab) cannot be double-booked.
4. **Teacher Availability Compliance**: Lessons are never placed during times a teacher is unavailable.
5. **Break / Lunch Protection**: No teaching entries overlap with designated break slots.
6. **Weekly Workload Fulfillment**: Every teaching assignment receives exactly its requested number of periods per week.

#### Soft Constraints & Optimization Heuristics
- **Morning Preference**: Subjects requiring high cognitive effort (e.g., Computer Science, Mathematics, Physics) are prioritized for early periods (`07:30 – 11:30`).
- **Maximum Consecutive Workload**: Prevents teacher burnout (e.g., no more than 3 continuous teaching periods for a single teacher).
- **Double-Period Handling**: Automatically groups consecutive periods for practical subjects or lab sessions (e.g., `07:30 – 09:20` contiguous Computer Science block).
- **Balanced Daily Distribution**: Evenly spreads a subject’s periods across the week (e.g., a 4-period assignment distributed over Monday, Wednesday, Thursday, Friday rather than crammed into one day).

---

### 5. Multi-Period Display & Visualization Options

When a subject requires 2 consecutive periods (e.g., 50 min per period = 100 min block), the system supports dual visualization modes:

1. **Unified Block View**: Displays as one merged cell `07:30 – 09:10 — Computer Science (Briyand)`.
2. **Split Cell View**: Displays as two distinct atomic cells (`07:30 – 08:20` & `08:20 – 09:10`).

Administrators can toggle between both views seamlessly depending on printing or display preference.

---

### 6. Conflict Detection & Real-Time Validation Engine

The conflict engine validates all manual edits instant-by-instant. If an administrator attempts an invalid drag-and-drop or slot swap, the system blocks the action and provides explicit diagnostic warnings:

```
❌ IMPOSSIBLE MOVE DETECTED

⚠️ Cannot move lesson. Teacher "Briyand" is already teaching "Form 5A (Mathematics)" on Monday at 07:30 – 08:25.
```

---

### 7. Interactive Manual Editing & Lesson Locking (🔒)

Automatic generation provides an optimal baseline, but real-world school dynamics require human touch.

#### Manual Editor Capabilities
- **Drag-and-Drop Lessons**: Move a period from one time slot or day to another.
- **Swap Lessons**: Swap two scheduled lessons between time slots or classes.
- **Reassign Teacher / Room**: Change the designated teacher or classroom for a single session.
- **Add / Remove Lessons**: Inject temporary sessions or remove unneeded periods.

#### Granular Lesson Locking (🔒)
When an administrator is satisfied with specific timetable slots (e.g., Monday morning Computer Science for Upper Sixth Science), they can **Lock (🔒)** those entries.

```
Monday 07:30 – 09:20 | Upper Sixth Science | Computer Science | Teacher: Briyand | 🔒 LOCKED
```

**Regeneration Behavior**: When clicking `Regenerate Timetable`, the constraint solver treats locked entries as immovable fixed points. It re-executes the solver algorithm only on the remaining unlocked slots, preserving all locked administrator customizations.

---

## 📊 Timetable Views & Output Formats

The platform provides 3 core interactive and printable views:

### 1. Class Timetable View

Tailored for students and class master noticeboards.

#### UPPER SIXTH SCIENCE — ACADEMIC YEAR 2026/2027

| Time Slot | Monday | Tuesday | Wednesday | Thursday | Friday |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **07:30 – 08:25** | Computer Science *(Briyand)* | Mathematics *(John)* | Physics *(Paul)* | English *(Mary)* | Chemistry *(David)* |
| **08:25 – 09:20** | Computer Science *(Briyand)* | Mathematics *(John)* | Physics *(Paul)* | English *(Mary)* | Chemistry *(David)* |
| **09:20 – 09:40** | ☕ **BREAK** | ☕ **BREAK** | ☕ **BREAK** | ☕ **BREAK** | ☕ **BREAK** |
| **09:40 – 10:35** | Physics *(Paul)* | Chemistry *(David)* | Mathematics *(John)* | Biology *(Peter)* | English *(Mary)* |
| **10:35 – 11:30** | Physics *(Paul)* | Chemistry *(David)* | Mathematics *(John)* | Biology *(Peter)* | Computer Science *(Briyand)* |
| **11:30 – 12:30** | 🍱 **LUNCH** | 🍱 **LUNCH** | 🍱 **LUNCH** | 🍱 **LUNCH** | 🍱 **LUNCH** |
| **12:30 – 01:25** | Mathematics *(John)* | Computer Science *(Briyand)* | Biology *(Peter)* | Physical Ed. *(Mark)* | Physics *(Paul)* |

---

### 2. Teacher Timetable View

Tailored for individual teacher reference and personal schedule tracking.

#### TEACHER SCHEDULE: BRIYAND — ACADEMIC YEAR 2026/2027

| Time Slot | Monday | Tuesday | Wednesday | Thursday | Friday |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **07:30 – 08:25** | Upper 6 Sci *(Comp Sci)* | Form 5A *(Maths)* | — | Lower 6 Sci *(Comp Sci)* | — |
| **08:25 – 09:20** | Upper 6 Sci *(Comp Sci)* | Form 5A *(Maths)* | — | Lower 6 Sci *(Comp Sci)* | — |
| **09:20 – 09:40** | ☕ **BREAK** | ☕ **BREAK** | ☕ **BREAK** | ☕ **BREAK** | ☕ **BREAK** |
| **09:40 – 10:35** | — | — | — | — | Upper 6 Sci *(Comp Sci)* |
| **10:35 – 11:30** | — | — | — | — | Lower 6 Sci *(Comp Sci)* |
| **11:30 – 12:30** | 🍱 **LUNCH** | 🍱 **LUNCH** | 🍱 **LUNCH** | 🍱 **LUNCH** | 🍱 **LUNCH** |
| **12:30 – 01:25** | — | Upper 6 Sci *(Comp Sci)* | Form 5B *(Maths)* | — | — |

---

### 3. Master Timetable View

A consolidated grid containing all classes, sections, and streams across the entire school on a single master sheet for administration oversight and central notice board display.

```
========================================================================================
                      MBOA COLLEGE — MASTER TIMETABLE — 2026/2027
========================================================================================

 [ CLASS: UPPER SIXTH SCIENCE ]
 Monday → Friday Schedules (7:30 AM – 3:15 PM)

 [ CLASS: UPPER SIXTH ARTS ]
 Monday → Friday Schedules (7:30 AM – 3:15 PM)

 [ CLASS: LOWER SIXTH SCIENCE ]
 Monday → Friday Schedules (7:30 AM – 3:15 PM)

 [ CLASS: FORM 5A / 5B / 5C ]
 Monday → Friday Schedules (7:30 AM – 3:15 PM)
```

---

## 🖨️ High-Resolution PDF Export & Print Engine

The layout engine supports high-density, vector-formatted PDF generation designed specifically for large-format physical prints:

- **A3 Landscape Format** *(Default)*: Optimized for standard administrative desk binders, staff room notice boards, and office display.
- **A2 Landscape Format**: Optimized for large wall-mounted master timetables in main administrative halls.
- **PDF Layout Elements**:
  - Official School Header with Logo, School Name, and Motto.
  - Academic Year & Document Subtitle (e.g., `CLASS TIMETABLE: FORM 5A - 2026/2027`).
  - High-contrast grid borders with clean typography.
  - Distinct block shading for break/lunch intervals.
  - Summary metadata footer (Total periods, Date of generation, Admin signature block).

---

## 🗄️ Database & Domain Entity Model

The domain model enforces multi-tenant isolation while supporting flexible scheduling relationships:

```
                               ┌─────────────┐
                               │    User     │
                               └──────┬──────┘
                                      │
                               ┌──────┴──────┐
                               │   School    │
                               └──────┬──────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
    ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
    │  SchoolAdmin│            │AcademicYear │            │    Room     │
    └─────────────┘            └──────┬──────┘            └─────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
 ┌─────────────┐               ┌─────────────┐               ┌─────────────┐
 │    Class    │               │   Teacher   │               │   Subject   │
 └──────┬──────┘               └──────┬──────┘               └─────────────┘
        │                             │
 ┌──────┴──────┐               ┌──────┴──────────────┐
 │ClassSection │               │TeacherAvailability  │
 └──────┬──────┘               └──────┬──────────────┘
        │                             │
        └──────────────┬──────────────┘
                       ▼
            ┌─────────────────────┐
            │ TeachingAssignment  │ (Teacher + ClassSection + Subject + ReqPeriods)
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │   TimetableEntry    │ (Day + Slot/Period + Room + Lock Status)
            └─────────────────────┘
```

### Key Data Entities

- `User`: System-wide authentication entity (SuperAdmin, SchoolAdmin, Teacher).
- `School`: Multi-tenant root organization profile.
- `SchoolAdmin`: Administrative user bound to a specific school tenant.
- `AcademicYear`: Configuration period (e.g., `2026/2027`).
- `SchoolDay` & `Period`: Daily grid structure definitions.
- `Break`: Non-teaching time slots (Morning Break, Lunch).
- `Class` & `ClassSection`: Educational tiers (e.g., `Form 5`, arm `A`).
- `Teacher` & `TeacherAvailability`: Instructor profile and restricted day/time slots.
- `Subject`: Course definition (e.g., Computer Science, Further Math, Chemistry).
- `Room`: Physical location capacity (e.g., `Lab 1`, `Room 102`, `Main Hall`).
- `TeachingAssignment`: Core workload contract linking `Teacher`, `ClassSection`, `Subject`, and `PeriodsPerWeek`.
- `Timetable`: Container for a generated schedule version.
- `TimetableEntry`: Atomic schedule slot containing `Assignment`, `Day`, `Period`, `Room`, and `IsLocked` flag.
- `TimetableConstraint`: Rules for solver execution (max consecutive periods, subject morning preferences).
- `TimetableLock`: Explicit persistent locks set by administrators on specific entries.

---

## 🏗️ System Architecture & Technology Stack

```
                   ┌────────────────────────────────────────┐
                   │         Web Application (UI)           │
                   │  React / Next.js / Vite / Tailwind CSS  │
                   └──────────────────┬─────────────────────┘
                                      │ REST API / WebSockets
                                      ▼
                   ┌────────────────────────────────────────┐
                   │            Backend API Service         │
                   │    Node.js (TypeScript) / Python / Go  │
                   └──────┬──────────────────────────┬──────┘
                          │                          │
                          ▼                          ▼
       ┌──────────────────────────────┐   ┌──────────────────────────────┐
       │   Timetable Engine (CSP)     │   │      PDF Render Engine       │
       │   OR-Tools / OptaPlanner     │   │   Puppeteer / PDFKit / SVG   │
       └──────────────────────────────┘   └──────────────────────────────┘
```

- **Frontend**: Responsive Web Client (React, TypeScript, Tailwind CSS, HTML5 Drag-and-Drop API).
- **Backend API**: RESTful / GraphQL microservices managing tenancy, CRUD endpoints, and engine orchestration.
- **Timetable Engine**: Constraint Satisfaction Problem (CSP) Solver written in Python/Go or utilizing established solvers like Google OR-Tools / OptaPlanner.
- **Database**: PostgreSQL with Tenant Isolation (Row Level Security or Schema-per-tenant).
- **PDF Generator**: Headless Chromium / Puppeteer engine rendering vector A3/A2 landscape printable documents.

---

## 🔮 Future Roadmap & Platform Vision

1. **Role-Based Portals**:
   - Dedicated **Teacher Portal** for viewing personal schedules, requesting time swaps, and marking attendance.
   - Dedicated **Student & Parent Portal** to view weekly schedules and room updates.
2. **Workload & Analytics Dashboard**:
   - Institutional reports highlighting teacher workload distribution, free period gaps, and room utilization efficiency.
3. **Automated Substitution Engine**:
   - Real-time substitute teacher assignment when a staff member is absent, automatically checking availability and subject competence.
4. **Bilingual Subsystem Preset Templates**:
   - One-click configuration presets pre-populated with standard Cameroonian MINESEC curricula requirements for both Anglophone (General & Technical) and Francophone (Enseignement Général et Technique) subsystems.

---

## 📝 License & Project Status

- **Project Status**: Active Development / Architectural Blueprint.
- **Target Deployment**: Cameroonian Secondary Schools (MINESEC Aligned).
