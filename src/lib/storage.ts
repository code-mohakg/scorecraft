/**
 * File System Storage Management via API
 * Persists data to the project's 'data' directory
 */

import {
  User,
  Grade,
  Subject,
  Chapter,
  LearningObjective,
  Question,
  TestSession,
  TestResult,
  QuestionReview,
} from '@/types';

const DATA_KEYS = {
  USERS: 'users',
  GRADES: 'grades',
  SUBJECTS: 'subjects',
  CHAPTERS: 'chapters',
  LEARNING_OBJECTIVES: 'los',
  QUESTIONS: 'questions',
  TEST_SESSIONS: 'test_sessions',
  TEST_RESULTS: 'test_results',
  QUESTION_REVIEWS: 'question_reviews',
  CURRENT_USER: 'current_user',
};

// Detection for Vercel/Serverless environments
const IS_VERCEL = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL;
const IS_BROWSER = typeof window !== 'undefined';

/**
 * Generic API-based storage functions
 */
export const storage = {
  async getAll<T>(key: string): Promise<T[]> {
    // Fallback to localStorage if on Vercel
    if (IS_VERCEL && IS_BROWSER) {
      const data = localStorage.getItem(`scorecraft_${key}`);
      return data ? JSON.parse(data) : [];
    }

    try {
      const res = await fetch(`/api/data/${key}`);
      if (!res.ok) {
        // Try fallback if API fails
        if (IS_BROWSER) {
          const data = localStorage.getItem(`scorecraft_${key}`);
          return data ? JSON.parse(data) : [];
        }
        return [];
      }
      return await res.json();
    } catch {
      if (IS_BROWSER) {
        const data = localStorage.getItem(`scorecraft_${key}`);
        return data ? JSON.parse(data) : [];
      }
      return [];
    }
  },

  async saveAll<T>(key: string, data: T[]): Promise<void> {
    // Save to localStorage if on Vercel
    if (IS_VERCEL && IS_BROWSER) {
      localStorage.setItem(`scorecraft_${key}`, JSON.stringify(data));
      return;
    }

    try {
      const res = await fetch(`/api/data/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok && IS_BROWSER) {
        localStorage.setItem(`scorecraft_${key}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error(`Failed to save to FS: ${key}`, error);
      if (IS_BROWSER) {
        localStorage.setItem(`scorecraft_${key}`, JSON.stringify(data));
      }
    }
  },

  // Current user still uses localStorage for session persistence across refreshes
  getSync: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  setSync: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },

  removeSync: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

/**
 * User Management
 */
export const userStorage = {
  getAll: () => storage.getAll<User>(DATA_KEYS.USERS),
  async getById(id: string) {
    const users = await this.getAll();
    return users.find((u) => u.id === id);
  },
  async save(user: User) {
    const users = await this.getAll();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    await storage.saveAll(DATA_KEYS.USERS, users);
  },
  async delete(id: string) {
    const users = await this.getAll();
    await storage.saveAll(DATA_KEYS.USERS, users.filter((u) => u.id !== id));
  },
};

/**
 * Grade Management
 */
export const gradeStorage = {
  getAll: () => storage.getAll<Grade>(DATA_KEYS.GRADES),
  async getById(id: string) {
    const grades = await this.getAll();
    return grades.find((g) => g.id === id);
  },
  async save(grade: Grade) {
    const grades = await this.getAll();
    const index = grades.findIndex((g) => g.id === grade.id);
    if (index >= 0) grades[index] = grade;
    else grades.push(grade);
    await storage.saveAll(DATA_KEYS.GRADES, grades);
  },
  async delete(id: string) {
    const grades = await this.getAll();
    await storage.saveAll(DATA_KEYS.GRADES, grades.filter((g) => g.id !== id));
  },
};

/**
 * Subject Management
 */
export const subjectStorage = {
  getAll: () => storage.getAll<Subject>(DATA_KEYS.SUBJECTS),
  async getById(id: string) {
    const subjects = await this.getAll();
    return subjects.find((s) => s.id === id);
  },
  async save(subject: Subject) {
    const subjects = await this.getAll();
    const index = subjects.findIndex((s) => s.id === subject.id);
    if (index >= 0) subjects[index] = subject;
    else subjects.push(subject);
    await storage.saveAll(DATA_KEYS.SUBJECTS, subjects);
  },
  async delete(id: string) {
    const subjects = await this.getAll();
    await storage.saveAll(DATA_KEYS.SUBJECTS, subjects.filter((s) => s.id !== id));
  },
};

/**
 * Chapter Management
 */
export const chapterStorage = {
  getAll: () => storage.getAll<Chapter>(DATA_KEYS.CHAPTERS),
  async getById(id: string) {
    const chapters = await this.getAll();
    return chapters.find((c) => c.id === id);
  },
  async save(chapter: Chapter) {
    const chapters = await this.getAll();
    const index = chapters.findIndex((c) => c.id === chapter.id);
    if (index >= 0) chapters[index] = chapter;
    else chapters.push(chapter);
    await storage.saveAll(DATA_KEYS.CHAPTERS, chapters);
  },
  async delete(id: string) {
    const chapters = await this.getAll();
    await storage.saveAll(DATA_KEYS.CHAPTERS, chapters.filter((c) => c.id !== id));
  },
};

/**
 * Learning Objective Management
 */
export const loStorage = {
  getAll: () => storage.getAll<LearningObjective>(DATA_KEYS.LEARNING_OBJECTIVES),
  async getById(id: string) {
    const los = await this.getAll();
    return los.find((l) => l.id === id);
  },
  async save(lo: LearningObjective) {
    const los = await this.getAll();
    const index = los.findIndex((l) => l.id === lo.id);
    if (index >= 0) los[index] = lo;
    else los.push(lo);
    await storage.saveAll(DATA_KEYS.LEARNING_OBJECTIVES, los);
  },
  async delete(id: string) {
    const los = await this.getAll();
    await storage.saveAll(DATA_KEYS.LEARNING_OBJECTIVES, los.filter((l) => l.id !== id));
  },
};

/**
 * Question Management
 */
export const questionStorage = {
  getAll: () => storage.getAll<Question>(DATA_KEYS.QUESTIONS),
  async getById(id: string) {
    const questions = await this.getAll();
    return questions.find((q) => q.id === id);
  },
  async save(question: Question) {
    const questions = await this.getAll();
    const index = questions.findIndex((q) => q.id === question.id);
    if (index >= 0) questions[index] = question;
    else questions.push(question);
    await storage.saveAll(DATA_KEYS.QUESTIONS, questions);
  },
  async delete(id: string) {
    const questions = await this.getAll();
    await storage.saveAll(DATA_KEYS.QUESTIONS, questions.filter((q) => q.id !== id));
  },
};

/**
 * Test Session Management
 */
export const testSessionStorage = {
  getAll: () => storage.getAll<TestSession>(DATA_KEYS.TEST_SESSIONS),
  async getById(id: string) {
    const sessions = await this.getAll();
    return sessions.find((s) => s.id === id);
  },
  async save(session: TestSession) {
    const sessions = await this.getAll();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) sessions[index] = session;
    else sessions.push(session);
    await storage.saveAll(DATA_KEYS.TEST_SESSIONS, sessions);
  },
};

/**
 * Test Result Management
 */
export const testResultStorage = {
  getAll: () => storage.getAll<TestResult>(DATA_KEYS.TEST_RESULTS),
  async save(result: TestResult) {
    const results = await this.getAll();
    results.push(result);
    await storage.saveAll(DATA_KEYS.TEST_RESULTS, results);
  },
};

/**
 * Question Review Management
 */
export const reviewStorage = {
  getAll: () => storage.getAll<QuestionReview>(DATA_KEYS.QUESTION_REVIEWS),
  async save(review: QuestionReview) {
    const reviews = await this.getAll();
    const index = reviews.findIndex((r) => r.id === review.id);
    if (index >= 0) reviews[index] = review;
    else reviews.push(review);
    await storage.saveAll(DATA_KEYS.QUESTION_REVIEWS, reviews);
  },
};

/**
 * Current User Management (Keep in localStorage for session)
 */
export const currentUserStorage = {
  get: (): User | null => storage.getSync(DATA_KEYS.CURRENT_USER),
  set: (user: User | null): void => {
    if (user) storage.setSync(DATA_KEYS.CURRENT_USER, user);
    else storage.removeSync(DATA_KEYS.CURRENT_USER);
  },
};
