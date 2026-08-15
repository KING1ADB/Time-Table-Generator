import { z } from 'zod';

export const schoolSetupSchema = z.object({
  year: z.string().min(4, 'Academic year required (e.g. 2026/2027)'),
  periodDurationMinutes: z.number().min(30).max(120),
  days: z.array(z.string()).min(1, 'Select at least one school day'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  breaks: z.array(z.object({
    name: z.string().min(1, 'Break name required'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  })).optional().default([]),
});

export const classSectionSchema = z.object({
  className: z.string().min(1, 'Class name required (e.g. Form 5)'),
  subsystem: z.enum(['ANGLOPHONE', 'FRANCOPHONE']),
  sectionNames: z.array(z.string()).min(1, 'At least one section arm required (e.g. A, B)'),
});

export const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name required'),
  code: z.string().min(2, 'Subject code required'),
  isLabRequired: z.boolean().default(false),
});

export const roomSchema = z.object({
  name: z.string().min(1, 'Room name required'),
  capacity: z.number().min(1).default(50),
  isLab: z.boolean().default(false),
});

export const teacherSchema = z.object({
  name: z.string().min(2, 'Teacher name required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  maxPerDay: z.number().min(1).max(10).default(6),
});

export const teachingAssignmentSchema = z.object({
  teacherId: z.string().min(1, 'Select a teacher'),
  classSectionId: z.string().min(1, 'Select a class section'),
  subjectId: z.string().min(1, 'Select a subject'),
  periodsPerWeek: z.number().min(1).max(30),
  allowDoublePeriod: z.boolean().default(true),
  timePreference: z.enum(['ANY', 'MORNING', 'AFTERNOON']).default('ANY'),
});

export type SchoolSetupInput = z.infer<typeof schoolSetupSchema>;
export type ClassSectionInput = z.infer<typeof classSectionSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
export type TeachingAssignmentInput = z.infer<typeof teachingAssignmentSchema>;
