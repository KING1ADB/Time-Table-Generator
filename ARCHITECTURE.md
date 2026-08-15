# System Architecture & Recommended Tech Stack

> **Architectural blueprint, technology selection rationale, deployment strategy, and MVP scope guidelines for the Cameroonian Secondary School Timetable System.**

---

## 🛠️ Recommended Technology Stack

| Component | Technology | Rationale & Benefits |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js + TypeScript** | Rapid development, strong typing, server-side rendering (SSR), and smooth UI routing out of the box. |
| **UI Styling & Components** | **Tailwind CSS + shadcn/ui** | Rapid construction of accessible, responsive, and modern admin dashboards. |
| **Backend & Business Logic** | **Next.js API Routes / Server Actions** | Consolidates application logic in a single codebase, eliminating early multi-repo overhead. |
| **Database** | **PostgreSQL** | Industry-standard relational DB designed for complex foreign-key relational structures. |
| **ORM / Data Access** | **Prisma ORM** | Type-safe database queries, schema management, and automated migration tooling. |
| **Authentication** | **Auth.js (NextAuth) / Clerk** | Built-in tenant/school context session management, multi-role access control, and OAuth/Credential flows. |
| **Data Validation** | **Zod** | End-to-end schema validation sharing types between client forms and backend endpoints. |
| **Forms Handling** | **React Hook Form** | Dynamic form state management for complex class/assignment entry workflows. |
| **Timetable Generation Engine** | **Python 3.11+ + Google OR-Tools** | Industry-grade Constraint Satisfaction Problem (CSP) solver engine designed for mathematical scheduling. |
| **PDF Generation Engine** | **Python (ReportLab) / Browser Renderer** | Pixel-perfect vector rendering for A3 & A2 landscape high-resolution notice board prints. |
| **Hosting & Deployment** | **Vercel** | Automated CI/CD deployments for Next.js from GitHub with instant edge network delivery. |
| **Database Hosting** | **Neon PostgreSQL** | Serverless PostgreSQL with auto-scaling, instant branching, and zero infrastructure maintenance. |
| **File Storage** | **Cloudinary / Vercel Blob** | High-performance storage and CDN delivery for school logos and generated PDF files. |
| **Source Control & CI/CD** | **GitHub** | Version control, automated deployments, and collaborative workflow tracking. |

---

## 📐 System Architecture Diagram

```
                        ┌─────────────────────────────────────┐
                        │               VERCEL                │
                        │                                     │
                        │        Next.js Application          │
                        │                                     │
                        │  ┌──────────────────────────────┐   │
                        │  │ Admin & School Dashboards    │   │
                        │  │ Interactive Timetable Grid   │   │
                        │  └──────────────┬───────────────┘   │
                        │                 │                   │
                        │  ┌──────────────▼───────────────┐   │
                        │  │ API Routes / Server Actions  │   │
                        │  └──────────────────────────────┘   │
                        └──────────────────┬──────────────────┘
                                           │
                ┌──────────────────────────┴──────────────────────────┐
                │                                                     │
                ▼                                                     ▼
┌───────────────────────────────┐                     ┌───────────────────────────────┐
│             NEON              │                     │        TIMETABLE ENGINE       │
│      Serverless PostgreSQL    │                     │  (Railway / Dedicated API)    │
│       (via Prisma ORM)        │                     │     Python 3.11 + FastAPI     │
└───────────────────────────────┘                     │       Google OR-Tools         │
                                                      └───────────────────────────────┘
```

---

## 🗄️ Database Choice Rationale: Why PostgreSQL over MongoDB?

Timetable management systems are **inherently relational**. Data consistency and strict foreign key integrity are non-negotiable requirements.

### Relational Hierarchy Example

```
School
  │
  ├── Teachers
  ├── Classes & Sections
  ├── Subjects
  │
  └── Academic Years
          │
          ▼
   Teaching Assignments
          │
          ├── Teacher ID (Foreign Key)
          ├── Class ID (Foreign Key)
          └── Subject ID (Foreign Key)
                  │
                  ▼
             Timetable
                  │
                  ├── Day Slot
                  ├── Period Slot
                  ├── Teacher ID (Foreign Key)
                  └── Class ID (Foreign Key)
```

### PostgreSQL vs. MongoDB Rationale

- **Strict Relational Integrity**: Prevents orphaned entries (e.g. deleting a class auto-cleans or blocks orphan timetable entries).
- **Complex Query Joins**: Easily fetches multi-table views (e.g., Master Timetable linking Classes, Teachers, Subjects, Rooms, and Locks).
- **Serverless PostgreSQL via Neon**: Eliminates database server administration while providing instant serverless scaling and branchable environments.

---

## ⚡ Architectural Strategy: Monolithic Next.js MVP + Isolated Engine

### 1. Single Codebase for App & Backend (Next.js Monorepo)

For rapid initial development, **avoid creating a separate Express/Node.js backend API server**.

#### ❌ Avoid Initial Over-Engineering
```
Next.js Frontend ──► Node.js / Express API ──► Database
(2 Repositories to build, test, deploy, monitor, and secure)
```

#### ✅ Preferred MVP Architecture
```
Next.js (Frontend + Server Actions + API Routes + Auth + Prisma) ──► PostgreSQL
(1 Repository, unified TypeScript types, zero API boilerplate)
```

---

### 2. Isolated Timetable Generation Engine Microservice

While the application backend resides in Next.js, the **Timetable Generator Engine MUST be isolated** as a lightweight dedicated microservice.

#### Rationale
- Scheduling 60 teachers, 40 classes, and 500+ weekly period slots with multi-variable constraints (breaks, room limits, teacher availability, double periods, consecutive period limits) is an $NP$-hard combinatorial optimization problem.
- **Google OR-Tools** (available natively in Python and C++) provides high-performance constraint programming solvers (`CP-SAT` solver) that outperform custom JavaScript loops by orders of magnitude.

#### Next.js ↔ Engine Interaction Protocol

The Next.js app sends a JSON payload to the Python engine API endpoint:

```json
POST /api/v1/generate-timetable
{
  "schoolId": "sch_mboa_01",
  "academicYearId": "2026_2027",
  "operatingHours": { "start": "07:30", "end": "15:15", "periodDurationMinutes": 55 },
  "breaks": [{ "name": "Morning Break", "start": "09:20", "end": "09:40" }],
  "classes": ["Form 5A", "Upper Sixth Science"],
  "teachers": ["teacher_briyand", "teacher_john"],
  "assignments": [
    {
      "id": "assign_101",
      "teacherId": "teacher_briyand",
      "classId": "Upper Sixth Science",
      "subjectId": "Computer Science",
      "periodsPerWeek": 4,
      "allowDoublePeriods": true,
      "preferredTime": "MORNING"
    }
  ],
  "lockedEntries": [
    { "classId": "Upper Sixth Science", "day": "MONDAY", "period": 1, "assignmentId": "assign_101" }
  ]
}
```

The Python service returns the computed conflict-free schedule grid or explicit constraint bottleneck alerts if impossible:

```json
{
  "status": "SUCCESS",
  "executionTimeMs": 420,
  "timetableEntries": [
    { "day": "MONDAY", "period": 1, "assignmentId": "assign_101", "isLocked": true },
    { "day": "MONDAY", "period": 2, "assignmentId": "assign_101", "isLocked": false }
  ]
}
```

---

## 🚀 Deployment Strategy

Keep deployment simple, automated, and serverless for the MVP:

```
                  ┌────────────────────────────────────────┐
                  │                 GitHub                 │
                  └───────────────────┬────────────────────┘
                                      │ Auto-Deploy Trigger
                                      ▼
           ┌──────────────────────────┴──────────────────────────┐
           │                                                     │
           ▼                                                     ▼
┌─────────────────────┐                               ┌─────────────────────┐
│       Vercel        │                               │       Railway       │
│                     │                               │                     │
│ Next.js Web App &   │                               │ Python + FastAPI    │
│ Server Actions      │                               │ OR-Tools Engine     │
└──────────┬──────────┘                               └─────────────────────┘
           │
           ▼
┌─────────────────────┐
│    Neon Database    │
│ Serverless Postgres │
└─────────────────────┘
```

- **Next.js Web App**: Deployed on **Vercel** (Continuous deployment on `git push main`).
- **PostgreSQL Database**: Provisioned on **Neon** (Connect via Prisma connection string).
- **Python Scheduling Service**: Deployed on **Railway** / **Render** (Minimal Docker/Python container).

---

## 🎯 Recommended MVP Stack Summary

```
Frontend            ► Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
Backend Logic       ► Next.js API Routes & Server Actions
Database            ► PostgreSQL (Neon Serverless)
ORM                 ► Prisma
Authentication      ► Auth.js (NextAuth) / Clerk
Form & Validation   ► React Hook Form + Zod
Timetable Engine    ► Python 3.11 + FastAPI + Google OR-Tools
PDF Generator       ► Python ReportLab / Puppeteer
Hosting & CI/CD     ► Vercel (Frontend) + Railway (Engine) + GitHub (Version Control)
```

---

## 🛑 What NOT to Use initially (Anti-Patterns for MVP)

To ensure rapid delivery and avoid unnecessary operational complexity, **DO NOT** use the following technologies in the initial phase:

- ❌ **Microservices Architecture Everywhere** (Keep everything in Next.js except the Python engine).
- ❌ **Kubernetes / AWS ECS / Docker Swarm** (Use serverless Vercel + Railway instead).
- ❌ **MongoDB / NoSQL** (Data is strictly relational; document stores cause severe data inconsistency).
- ❌ **Redis / RabbitMQ Message Queues** (Direct HTTP sync calls between Next.js & Python engine are sufficient for MVP).
- ❌ **Separate Express / Node.js Backend API** (Use Next.js Server Actions and API routes).
- ❌ **GraphQL** (Prisma ORM + REST/Server Actions provide cleaner type safety with less boilerplate).
- ❌ **Multi-Repository Setup** (Keep Next.js web app in a single monorepo).

---

## 📁 Repository & Directory Structure

```
cameroon-school-timetable/
│
├── app/                      # Next.js App Router (Pages, Layouts & API Routes)
│   ├── admin/                # System Admin portal (School provisioning, accounts)
│   ├── school/               # School Admin portal (Setup, teachers, classes, subjects)
│   ├── timetable/            # Interactive Timetable Grid & Viewers (Class, Teacher, Master)
│   └── api/                  # API endpoints & server actions
│
├── components/               # Shared & UI components (shadcn/ui, grids, forms, modals)
│
├── lib/                      # Business logic, helpers, and domain utilities
│   ├── db/                   # Database client (Prisma instance)
│   ├── auth/                 # Authentication & authorization helpers
│   ├── validation/           # Zod validation schemas
│   └── timetable/            # Client-side timetable utilities & formatters
│
├── prisma/                   # Database ORM configuration
│   └── schema.prisma         # PostgreSQL relational schema definitions
│
├── scheduler/                # Isolated Python Solver Microservice
│   ├── main.py               # FastAPI entry point & API routes
│   ├── solver.py             # Google OR-Tools CP-SAT solver implementation
│   ├── constraints.py        # Scheduling rules & constraint definitions
│   └── requirements.txt      # Python dependencies (ortools, fastapi, uvicorn)
│
├── public/                   # Static assets (logos, images, default templates)
│
└── package.json              # Web app dependencies and scripts
```

---

## 📝 Document Information

- **File Name**: `ARCHITECTURE.md`
- **Related Documentation**: [README.md](file:///d:/Neurivex%20Group/Time-Table-Generator/README.md)
- **Target Platform**: Cameroonian Secondary School SaaS Platform
