import { create } from 'zustand';
import { Question, DifficultyLevel, QuestionStatus, QuestionOption } from '@/types';
import { questionStorage, reviewStorage } from '@/lib/storage';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';

interface QuestionsStore {
  questions: Question[];
  getQuestions: () => Promise<void>;
  getQuestionsByStatus: (status: QuestionStatus) => Question[];
  getApprovedQuestionsByLO: (loId: string) => Question[];
  getQuestionById: (id: string) => Question | undefined;
  createQuestion: (
    text: string,
    options: QuestionOption[],
    correctOptionId: string,
    loId: string,
    chapterId: string,
    subjectId: string,
    gradeId: string,
    difficulty: DifficultyLevel,
    explanation: string,
    createdBy: string,
    tags?: string[]
  ) => Promise<Question>;
  updateQuestion: (id: string, data: Partial<Question>) => Promise<void>;
  submitQuestion: (id: string) => Promise<void>;
  approveQuestion: (id: string) => Promise<void>;
  rejectQuestion: (id: string) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
}

export const useQuestionsStore = create<QuestionsStore>((set, get) => ({
  questions: [],

  getQuestions: async () => {
    const questions = await questionStorage.getAll();
    set({ questions });
  },

  getQuestionsByStatus: (status: QuestionStatus) => {
    return get().questions.filter((q) => q.status === status);
  },

  getApprovedQuestionsByLO: (loId: string) => {
    return get().questions.filter((q) => q.loId === loId && q.status === QuestionStatus.APPROVED);
  },

  getQuestionById: (id: string) => {
    return get().questions.find((q) => q.id === id);
  },

  createQuestion: async (
    text: string,
    options: QuestionOption[],
    correctOptionId: string,
    loId: string,
    chapterId: string,
    subjectId: string,
    gradeId: string,
    difficulty: DifficultyLevel,
    explanation: string,
    createdBy: string,
    tags?: string[]
  ) => {
    const question: Question = {
      id: generateId(),
      text,
      loId,
      chapterId,
      subjectId,
      gradeId,
      type: 'mcq',
      options,
      correctOptionId,
      difficulty,
      explanation,
      tags: tags || [],
      createdBy,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      status: QuestionStatus.DRAFT,
    };
    await questionStorage.save(question);
    set({ questions: [...get().questions, question] });
    return question;
  },

  updateQuestion: async (id: string, data: Partial<Question>) => {
    const question = get().questions.find(q => q.id === id);
    if (question) {
      const updated = {
        ...question,
        ...data,
        updatedAt: getCurrentTimestamp(),
      };
      await questionStorage.save(updated);
      set({
        questions: get().questions.map((q) => (q.id === id ? updated : q)),
      });
    }
  },

  submitQuestion: async (id: string) => {
    await get().updateQuestion(id, { status: QuestionStatus.SUBMITTED });
  },

  approveQuestion: async (id: string) => {
    await get().updateQuestion(id, { status: QuestionStatus.APPROVED });
  },

  rejectQuestion: async (id: string) => {
    await get().updateQuestion(id, { status: QuestionStatus.REJECTED });
  },

  deleteQuestion: async (id: string) => {
    await questionStorage.delete(id);
    set({ questions: get().questions.filter((q) => q.id !== id) });
  },
}));
