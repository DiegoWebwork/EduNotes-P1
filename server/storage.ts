import { 
  users, 
  courses, 
  enrollments, 
  User, 
  InsertUser, 
  Course, 
  InsertCourse, 
  Enrollment, 
  InsertEnrollment, 
  Note, 
  InsertNote 
} from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
type SessionStoreType = ReturnType<typeof createMemoryStore>;

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByInstructor(instructor: string): Promise<Course[]>;
  getAllCourses(): Promise<Course[]>;
  getActiveCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;

  // Enrollment operations
  enrollStudent(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentsForUser(userId: number): Promise<Enrollment[]>;
  getEnrollmentsForCourse(courseId: number): Promise<Enrollment[]>;
  getEnrolledCourses(userId: number): Promise<Course[]>;
  getEnrolledStudents(courseId: number): Promise<User[]>;

  // Note operations (non-relational)
  createNote(note: InsertNote): Promise<Note>;
  getNotesByUser(userId: number): Promise<Note[]>;
  getNotesByCourse(courseId: number): Promise<Note[]>;
  getNotesByUserAndCourse(userId: number, courseId: number): Promise<Note[]>;
  getNoteById(id: string): Promise<Note | undefined>;
  updateNote(id: string, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;

  // Reports
  getCoursesWithNotesCount(): Promise<{ course: Course; noteCount: number; studentCount: number }[]>;
  getUsersWithNotesCount(): Promise<{ user: User; noteCount: number }[]>;
  
  // Session store
  sessionStore: SessionStoreType;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;
  private notes: Map<string, Note>;
  private userIdCounter: number;
  private courseIdCounter: number;
  private enrollmentIdCounter: number;
  public sessionStore: SessionStoreType;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.notes = new Map();
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "student" // Ensure role is always set
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByInstructor(instructor: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.instructor === instructor
    );
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getActiveCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.active
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const createdAt = new Date();
    const course: Course = { 
      ...insertCourse, 
      id, 
      createdAt,
      active: insertCourse.active !== undefined ? insertCourse.active : true  // Ensure active is set
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, courseUpdate: Partial<InsertCourse>): Promise<Course | undefined> {
    const existingCourse = await this.getCourse(id);
    if (!existingCourse) return undefined;
    
    const updatedCourse = { ...existingCourse, ...courseUpdate };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Enrollment operations
  async enrollStudent(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const enrolledAt = new Date();
    const enrollment: Enrollment = { ...insertEnrollment, id, enrolledAt };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async getEnrollmentsForUser(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.userId === userId
    );
  }

  async getEnrollmentsForCourse(courseId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.courseId === courseId
    );
  }

  async getEnrolledCourses(userId: number): Promise<Course[]> {
    const userEnrollments = await this.getEnrollmentsForUser(userId);
    const courseIds = userEnrollments.map((enrollment) => enrollment.courseId);
    return (await Promise.all(courseIds.map((id) => this.getCourse(id)))).filter(Boolean) as Course[];
  }

  async getEnrolledStudents(courseId: number): Promise<User[]> {
    const courseEnrollments = await this.getEnrollmentsForCourse(courseId);
    const userIds = courseEnrollments.map((enrollment) => enrollment.userId);
    return (await Promise.all(userIds.map((id) => this.getUser(id)))).filter(Boolean) as User[];
  }

  // Note operations (non-relational)
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const note: Note = { ...insertNote, id, createdAt };
    this.notes.set(id, note);
    return note;
  }

  async getNotesByUser(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId
    );
  }

  async getNotesByCourse(courseId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.courseId === courseId
    );
  }

  async getNotesByUserAndCourse(userId: number, courseId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId && note.courseId === courseId
    );
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async updateNote(id: string, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = await this.getNoteById(id);
    if (!existingNote) return undefined;
    
    const updatedNote = { ...existingNote, ...noteUpdate };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Reports
  async getCoursesWithNotesCount(): Promise<{ course: Course; noteCount: number; studentCount: number }[]> {
    const allCourses = await this.getAllCourses();
    const result = [];

    for (const course of allCourses) {
      const notes = await this.getNotesByCourse(course.id);
      const enrollments = await this.getEnrollmentsForCourse(course.id);
      
      result.push({
        course,
        noteCount: notes.length,
        studentCount: enrollments.length
      });
    }

    return result;
  }

  async getUsersWithNotesCount(): Promise<{ user: User; noteCount: number }[]> {
    const allUsers = await this.getAllUsers();
    const result = [];

    for (const user of allUsers) {
      if (user.role === "student") {
        const notes = await this.getNotesByUser(user.id);
        result.push({
          user,
          noteCount: notes.length
        });
      }
    }

    return result;
  }
}

export const storage = new MemStorage();
