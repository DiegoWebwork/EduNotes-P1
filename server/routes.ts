import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCourseSchema, 
  insertNoteSchema, 
  insertEnrollmentSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is an admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
};

// Middleware to check if user is a student
const isStudent = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && req.user.role === "student") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Student access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Course routes
  
  // Get all courses
  app.get("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get active courses
  app.get("/api/courses/active", isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getActiveCourses();
      
      // If student, filter out already enrolled courses
      if (req.user && req.user.role === "student") {
        const enrolledCourses = await storage.getEnrolledCourses(req.user.id);
        const enrolledCourseIds = enrolledCourses.map(c => c.id);
        
        // Return only courses the student isn't already enrolled in
        const availableCourses = courses.filter(course => !enrolledCourseIds.includes(course.id));
        return res.json(availableCourses);
      }
      
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active courses" });
    }
  });

  // Get course by ID
  app.get("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id, 10);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Create course (admin only)
  app.post("/api/courses", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      
      const newCourse = await storage.createCourse({
        ...validatedData,
        createdBy: req.user!.id
      });
      
      res.status(201).json(newCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Update course (admin only)
  app.put("/api/courses/:id", isAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id, 10);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const validatedData = insertCourseSchema.partial().parse(req.body);
      
      const updatedCourse = await storage.updateCourse(courseId, validatedData);
      res.json(updatedCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Delete course (admin only)
  app.delete("/api/courses/:id", isAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id, 10);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const success = await storage.deleteCourse(courseId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete course" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Enrollment routes
  
  // Enroll student in course
  app.post("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEnrollmentSchema.parse(req.body);
      
      // Check if course exists
      const course = await storage.getCourse(validatedData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Admins can enroll any student, but students can only enroll themselves
      if (req.user!.role !== "admin" && req.user!.id !== validatedData.userId) {
        return res.status(403).json({ message: "Forbidden: You can only enroll yourself" });
      }
      
      // Check if already enrolled
      const userEnrollments = await storage.getEnrollmentsForUser(validatedData.userId);
      const alreadyEnrolled = userEnrollments.some(e => e.courseId === validatedData.courseId);
      
      if (alreadyEnrolled) {
        return res.status(400).json({ message: "User already enrolled in this course" });
      }
      
      const enrollment = await storage.enrollStudent(validatedData);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // Get enrolled courses for current user
  app.get("/api/enrollments/my-courses", isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getEnrolledCourses(req.user!.id);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrolled courses" });
    }
  });

  // Get enrolled students for a course (admin only)
  app.get("/api/enrollments/course/:id", isAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id, 10);
      const students = await storage.getEnrolledStudents(courseId);
      
      // Remove password from response
      const studentsResponse = students.map(student => {
        const { password, ...rest } = student;
        return rest;
      });
      
      res.json(studentsResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrolled students" });
    }
  });

  // Note routes
  
  // Create note (student only)
  app.post("/api/notes", isStudent, async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      
      // Students can only create notes for themselves
      if (validatedData.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You can only create notes for yourself" });
      }
      
      // Check if course exists
      const course = await storage.getCourse(validatedData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if student is enrolled in the course
      const enrollments = await storage.getEnrollmentsForUser(req.user!.id);
      const isEnrolled = enrollments.some(e => e.courseId === validatedData.courseId);
      
      if (!isEnrolled) {
        return res.status(403).json({ message: "Forbidden: You must be enrolled in the course to create notes" });
      }
      
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // Get notes for current user
  app.get("/api/notes/my-notes", isStudent, async (req, res) => {
    try {
      const notes = await storage.getNotesByUser(req.user!.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  // Get notes for a specific course and current user
  app.get("/api/notes/course/:id", isStudent, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id, 10);
      const notes = await storage.getNotesByUserAndCourse(req.user!.id, courseId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes for course" });
    }
  });

  // Get note by ID
  app.get("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const noteId = req.params.id;
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Students can only view their own notes
      if (req.user!.role === "student" && note.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You can only view your own notes" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  // Update note
  app.put("/api/notes/:id", isStudent, async (req, res) => {
    try {
      const noteId = req.params.id;
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Students can only update their own notes
      if (note.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You can only update your own notes" });
      }
      
      const validatedData = insertNoteSchema.partial().parse(req.body);
      
      // Prevent changing the user ID
      if (validatedData.userId && validatedData.userId !== note.userId) {
        return res.status(400).json({ message: "Cannot change note ownership" });
      }
      
      const updatedNote = await storage.updateNote(noteId, validatedData);
      res.json(updatedNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  // Delete note
  app.delete("/api/notes/:id", isStudent, async (req, res) => {
    try {
      const noteId = req.params.id;
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Students can only delete their own notes
      if (note.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own notes" });
      }
      
      const success = await storage.deleteNote(noteId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete note" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Report routes
  
  // Get courses with notes count
  app.get("/api/reports/courses", isAdmin, async (req, res) => {
    try {
      const report = await storage.getCoursesWithNotesCount();
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate course report" });
    }
  });

  // Get users with notes count
  app.get("/api/reports/users", isAdmin, async (req, res) => {
    try {
      const report = await storage.getUsersWithNotesCount();
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate user report" });
    }
  });

  // User routes
  
  // Get all users (admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersResponse = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      
      res.json(usersResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
