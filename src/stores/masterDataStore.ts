/**
 * Zustand Store for Master Data Management
 */

import { create } from 'zustand';
import { Grade, Subject, Chapter, LearningObjective } from '@/types';
import {
  gradeStorage,
  subjectStorage,
  chapterStorage,
  loStorage,
} from '@/lib/storage';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';

interface MasterDataStore {
  // Grades
  grades: Grade[];
  getGrades: () => Promise<void>;
  addGrade: (name: string, description?: string) => Promise<Grade>;
  updateGrade: (id: string, name: string, description?: string) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;

  // Subjects
  subjects: Subject[];
  getSubjects: () => Promise<void>;
  getSubjectsByGrade: (gradeId: string) => Subject[];
  addSubject: (gradeId: string, name: string, description?: string) => Promise<Subject>;
  updateSubject: (id: string, name: string, description?: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Chapters
  chapters: Chapter[];
  getChapters: () => Promise<void>;
  getChaptersBySubject: (subjectId: string) => Chapter[];
  addChapter: (subjectId: string, name: string, description?: string) => Promise<Chapter>;
  updateChapter: (id: string, name: string, description?: string) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;

  // Learning Objectives
  los: LearningObjective[];
  getLOs: () => Promise<void>;
  getLOsByChapter: (chapterId: string) => LearningObjective[];
  addLO: (chapterId: string, code: string, description: string) => Promise<LearningObjective>;
  updateLO: (id: string, code: string, description: string) => Promise<void>;
  deleteLO: (id: string) => Promise<void>;
}

export const useMasterDataStore = create<MasterDataStore>((set, get) => ({
  grades: [],
  subjects: [],
  chapters: [],
  los: [],

  // Grades
  getGrades: async () => {
    const grades = await gradeStorage.getAll();
    set({ grades });
  },

  addGrade: async (name: string, description?: string) => {
    const grade: Grade = {
      id: generateId(),
      name,
      description,
      status: 'active',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    await gradeStorage.save(grade);
    set({ grades: [...get().grades, grade] });
    return grade;
  },

  updateGrade: async (id: string, name: string, description?: string) => {
    const grade = get().grades.find(g => g.id === id);
    if (grade) {
      const updated = {
        ...grade,
        name,
        description,
        updatedAt: getCurrentTimestamp(),
      };
      await gradeStorage.save(updated);
      set({
        grades: get().grades.map((g) => (g.id === id ? updated : g)),
      });
    }
  },

  deleteGrade: async (id: string) => {
    await gradeStorage.delete(id);
    set({ grades: get().grades.filter((g) => g.id !== id) });
  },

  // Subjects
  getSubjects: async () => {
    const subjects = await subjectStorage.getAll();
    set({ subjects });
  },

  getSubjectsByGrade: (gradeId: string) => {
    return get().subjects.filter((s) => s.gradeId === gradeId && s.status !== 'archived');
  },

  addSubject: async (gradeId: string, name: string, description?: string) => {
    const subject: Subject = {
      id: generateId(),
      name,
      description,
      gradeId,
      status: 'active',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    await subjectStorage.save(subject);
    set({ subjects: [...get().subjects, subject] });
    return subject;
  },

  updateSubject: async (id: string, name: string, description?: string) => {
    const subject = get().subjects.find(s => s.id === id);
    if (subject) {
      const updated = {
        ...subject,
        name,
        description,
        updatedAt: getCurrentTimestamp(),
      };
      await subjectStorage.save(updated);
      set({
        subjects: get().subjects.map((s) => (s.id === id ? updated : s)),
      });
    }
  },

  deleteSubject: async (id: string) => {
    await subjectStorage.delete(id);
    set({ subjects: get().subjects.filter((s) => s.id !== id) });
  },

  // Chapters
  getChapters: async () => {
    const chapters = await chapterStorage.getAll();
    set({ chapters });
  },

  getChaptersBySubject: (subjectId: string) => {
    return get().chapters
      .filter((c) => c.subjectId === subjectId && c.status !== 'archived')
      .sort((a, b) => a.order - b.order);
  },

  addChapter: async (subjectId: string, name: string, description?: string) => {
    const chapters = get().chapters.filter((c) => c.subjectId === subjectId);
    const chapter: Chapter = {
      id: generateId(),
      name,
      description,
      subjectId,
      order: chapters.length + 1,
      status: 'active',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    await chapterStorage.save(chapter);
    set({ chapters: [...get().chapters, chapter] });
    return chapter;
  },

  updateChapter: async (id: string, name: string, description?: string) => {
    const chapter = get().chapters.find(c => c.id === id);
    if (chapter) {
      const updated = {
        ...chapter,
        name,
        description,
        updatedAt: getCurrentTimestamp(),
      };
      await chapterStorage.save(updated);
      set({
        chapters: get().chapters.map((c) => (c.id === id ? updated : c)),
      });
    }
  },

  deleteChapter: async (id: string) => {
    await chapterStorage.delete(id);
    set({ chapters: get().chapters.filter((c) => c.id !== id) });
  },

  // Learning Objectives
  getLOs: async () => {
    const los = await loStorage.getAll();
    set({ los });
  },

  getLOsByChapter: (chapterId: string) => {
    return get().los.filter((lo) => lo.chapterId === chapterId && lo.status !== 'archived');
  },

  addLO: async (chapterId: string, code: string, description: string) => {
    const lo: LearningObjective = {
      id: generateId(),
      code,
      description,
      chapterId,
      status: 'active',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    await loStorage.save(lo);
    set({ los: [...get().los, lo] });
    return lo;
  },

  updateLO: async (id: string, code: string, description: string) => {
    const lo = get().los.find(l => l.id === id);
    if (lo) {
      const updated = {
        ...lo,
        code,
        description,
        updatedAt: getCurrentTimestamp(),
      };
      await loStorage.save(updated);
      set({
        los: get().los.map((l) => (l.id === id ? updated : l)),
      });
    }
  },

  deleteLO: async (id: string) => {
    await loStorage.delete(id);
    set({ los: get().los.filter((lo) => lo.id !== id) });
  },
}));
