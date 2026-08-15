# Production Deployment Guide — Cameroonian Secondary School Timetable SaaS

This document provides step-by-step instructions for deploying the Cameroonian Secondary School Timetable SaaS platform to production.

---

## 🏛️ Architecture & Infrastructure Summary

- **Frontend & App Backend**: Next.js 14 (App Router) on **Vercel**
- **Database**: PostgreSQL on **Neon Serverless PostgreSQL**
- **Timetable Engine Microservice**: Python 3.11 + FastAPI + Google OR-Tools on **Railway** / **Render**

---

## 1. Database Setup (Neon Serverless PostgreSQL)

1. Create a PostgreSQL project on [Neon.tech](https://neon.tech).
2. Obtain both connection strings from your Neon Dashboard:
   - **Pooled connection string** (for `DATABASE_URL` in app):
     `postgresql://user:pass@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true`
   - **Direct connection string** (for `DIRECT_URL` in Prisma migrations):
     `postgresql://user:pass@ep-direct.us-east-2.aws.neon.tech/neondb?sslmode=require`
3. Run migrations and seed data:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## 2. Deploy Python Scheduler Microservice (Railway / Render)

1. Connect your GitHub repository to [Railway.app](https://railway.app) or [Render.com](https://render.com).
2. Set root directory to `/scheduler`.
3. Select Dockerfile build context (`scheduler/Dockerfile`).
4. Set environment variable: `PORT=8000`.
5. Note the deployed service URL (e.g., `https://timetable-scheduler.up.railway.app`).

---

## 3. Deploy Next.js Web Application (Vercel)

1. Connect your repository to [Vercel.com](https://vercel.com).
2. Configure Production Environment Variables in Vercel Dashboard:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://user:pass@ep-direct.us-east-2.aws.neon.tech/neondb?sslmode=require"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="generated-32-char-secret-key"
   SCHEDULER_ENGINE_URL="https://timetable-scheduler.up.railway.app"
   ```
3. Trigger deployment.

---

## 4. Post-Deployment Verification

1. Log in as Super Admin (`admin@minesec.gov.cm` / `AdminPass123!`).
2. Provision a new school tenant account via `/admin/schools`.
3. Log in as School Admin, complete schedule setup, add classes, teachers, and teaching assignments.
4. Click **⚡ Run Auto-Generator** and verify vector PDF export & printing capabilities.
