import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "student"] }).notNull().default("student"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

// Courses Table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  duration: integer("duration").notNull(), // in weeks
  lessons: integer("lessons").notNull(),
  createdBy: integer("created_by").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

// Student Enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

// Notes (Non-relational)
export const NoteSchema = z.object({
  id: z.string().uuid(),
  userId: z.number(),
  courseId: z.number(),
  title: z.string(),
  content: z.string(),
  color: z.enum(["yellow", "blue", "green", "purple"]),
  createdAt: z.string().datetime(),
});

export const insertNoteSchema = NoteSchema.omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Note = z.infer<typeof NoteSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
