/**
 * User & Authentication Types
 */
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  gradeIds: string[];
  subjectIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  isAuthenticated: boolean;
}

/**
 * Content Hierarchy Types
 */
export interface Grade {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  gradeId: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  order: number;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface LearningObjective {
  id: string;
  code: string;
  description: string;
  chapterId: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

/**
 * Question Types
 */
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuestionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  loId: string; // Learning Objective ID
  chapterId: string;
  subjectId: string;
  gradeId: string;
  type: 'mcq'; // For now, only MCQ
  options: QuestionOption[];
  correctOptionId: string;
  difficulty: DifficultyLevel;
  explanation: string;
  tags: string[];
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
  status: QuestionStatus;
}

/**
 * Peer Review Types
 */
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
}

export interface QuestionReview {
  id: string;
  questionId: string;
  reviewedBy: string; // User ID
  status: ReviewStatus;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Test & Assessment Types
 */
export enum TestStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SUBMITTED = 'submitted',
}

export interface TestQuestion {
  questionId: string;
  selectedOptionId?: string;
  isCorrect?: boolean;
  timeSpent: number; // in seconds
}

export interface TestSession {
  id: string;
  studentId: string;
  gradeId: string;
  subjectId: string;
  chapterIds: string[];
  loIds?: string[];
  duration: number; // in minutes
  status: TestStatus;
  questions: TestQuestion[];
  startedAt: string;
  endedAt?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
}

/**
 * Results & Analytics Types
 */
export interface LOPerformance {
  loId: string;
  loCode: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
  status: 'strong' | 'practice' | 'focus';
}

export interface DifficultyPerformance {
  level: DifficultyLevel;
  correctCount: number;
  totalCount: number;
  percentage: number;
}

export interface TestResult {
  id: string;
  testSessionId: string;
  studentId: string;
  gradeId: string;
  subjectId: string;
  chapterIds: string[];
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  accuracy: number;
  timeTaken: number; // in seconds
  questionDetails: {
    questionId: string;
    status: 'correct' | 'incorrect' | 'skipped';
    selectedOptionId?: string;
    correctOptionId: string;
    timeSpent: number;
  }[];
  loPerformance: LOPerformance[];
  difficultyPerformance: DifficultyPerformance[];
  completedAt: string;
}

/**
 * CSV Upload Types
 */
export interface CSVUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: {
    rowIndex: number;
    reason: string;
  }[];
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}
