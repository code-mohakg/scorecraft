import { create } from 'zustand';
import { 
  TestSession, 
  TestResult, 
  TestStatus, 
  Question, 
  DifficultyLevel, 
  LOPerformance, 
  DifficultyPerformance 
} from '@/types';
import { testSessionStorage, testResultStorage, questionStorage } from '@/lib/storage';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';

interface TestStore {
  currentSession: TestSession | null;
  currentQuestion: Question | null;
  remainingTime: number; // in seconds
  
  startSession: (
    studentId: string, 
    gradeId: string, 
    subjectId: string, 
    chapterIds: string[], 
    duration: number
  ) => Promise<TestSession | null>;
  
  submitAnswer: (selectedOptionId: string) => Promise<void>;
  autoSubmit: () => Promise<void>;
  tick: () => void;
  
  getResults: (studentId: string) => Promise<TestResult[]>;
  finishTest: (session: TestSession) => Promise<void>;
}

export const useTestStore = create<TestStore>((set, get) => ({
  currentSession: null,
  currentQuestion: null,
  remainingTime: 0,

  startSession: async (studentId, gradeId, subjectId, chapterIds, duration) => {
    // 1. Check for sufficient approved questions
    const allQuestions = await questionStorage.getAll();
    const availableQuestions = allQuestions.filter(q => 
      q.status === 'approved' && 
      q.gradeId === gradeId && 
      q.subjectId === subjectId && 
      chapterIds.includes(q.chapterId)
    );

    if (availableQuestions.length < 5) {
      alert('Not enough approved questions in selected chapters to start a test. (Minimum 5 required)');
      return null;
    }

    // 2. Initialize session
    const session: TestSession = {
      id: generateId(),
      studentId,
      gradeId,
      subjectId,
      chapterIds,
      duration,
      status: TestStatus.IN_PROGRESS,
      questions: [],
      startedAt: getCurrentTimestamp(),
    };

    // 3. Select first question (Medium)
    const mediumQuestions = availableQuestions.filter(q => q.difficulty === DifficultyLevel.MEDIUM);
    const firstQuestion = mediumQuestions.length > 0 
      ? mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)]
      : availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    await testSessionStorage.save(session);
    
    set({ 
      currentSession: session, 
      currentQuestion: firstQuestion,
      remainingTime: duration * 60 
    });

    return session;
  },

  submitAnswer: async (selectedOptionId) => {
    const { currentSession, currentQuestion, remainingTime } = get();
    if (!currentSession || !currentQuestion) return;

    const isCorrect = currentQuestion.correctOptionId === selectedOptionId;
    const timeSpent = (currentSession.duration * 60) - remainingTime - (currentSession.questions.reduce((acc, q) => acc + q.timeSpent, 0));

    const updatedSession = {
      ...currentSession,
      questions: [
        ...currentSession.questions,
        {
          questionId: currentQuestion.id,
          selectedOptionId,
          isCorrect,
          timeSpent: Math.max(0, timeSpent),
        }
      ]
    };

    // Adaptive Logic: Determine next difficulty
    let nextDifficulty = currentQuestion.difficulty;
    if (isCorrect) {
      if (currentQuestion.difficulty === DifficultyLevel.EASY) nextDifficulty = DifficultyLevel.MEDIUM;
      else if (currentQuestion.difficulty === DifficultyLevel.MEDIUM) nextDifficulty = DifficultyLevel.HARD;
    } else {
      if (currentQuestion.difficulty === DifficultyLevel.HARD) nextDifficulty = DifficultyLevel.MEDIUM;
      else if (currentQuestion.difficulty === DifficultyLevel.MEDIUM) nextDifficulty = DifficultyLevel.EASY;
    }

    // Select next question
    const allQuestions = await questionStorage.getAll();
    const usedIds = updatedSession.questions.map(q => q.questionId);
    const availableQuestions = allQuestions.filter(q => 
      q.status === 'approved' && 
      q.gradeId === currentSession.gradeId && 
      q.subjectId === currentSession.subjectId && 
      currentSession.chapterIds.includes(q.chapterId) &&
      !usedIds.includes(q.id)
    );

    if (availableQuestions.length === 0 || remainingTime <= 0) {
      // End test
      await get().finishTest(updatedSession);
      return;
    }

    let nextQuestionPool = availableQuestions.filter(q => q.difficulty === nextDifficulty);
    if (nextQuestionPool.length === 0) {
      // Fallback to closest difficulty if preferred not available
      nextQuestionPool = availableQuestions;
    }
    
    const nextQuestion = nextQuestionPool[Math.floor(Math.random() * nextQuestionPool.length)];

    await testSessionStorage.save(updatedSession);
    set({ currentSession: updatedSession, currentQuestion: nextQuestion });
  },

  tick: () => {
    const { remainingTime, currentSession } = get();
    if (remainingTime > 0) {
      set({ remainingTime: remainingTime - 1 });
    } else if (currentSession && currentSession.status === TestStatus.IN_PROGRESS) {
      get().autoSubmit();
    }
  },

  autoSubmit: async () => {
    const { currentSession } = get();
    if (currentSession) {
      await get().finishTest(currentSession);
    }
  },

  finishTest: async (session: TestSession) => {
    const finalSession = {
      ...session,
      status: TestStatus.COMPLETED,
      endedAt: getCurrentTimestamp(),
    };

    // Calculate Results
    const questions = finalSession.questions;
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter(q => q.isCorrect).length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const timeTaken = (finalSession.duration * 60) - get().remainingTime;

    const allQuestions = await questionStorage.getAll();

    // Detailed breakdown for analytics
    const loPerformanceMap: Record<string, { total: number, correct: number, code: string }> = {};
    const diffPerformanceMap: Record<string, { total: number, correct: number }> = {
      [DifficultyLevel.EASY]: { total: 0, correct: 0 },
      [DifficultyLevel.MEDIUM]: { total: 0, correct: 0 },
      [DifficultyLevel.HARD]: { total: 0, correct: 0 },
    };

    questions.forEach(tq => {
      const q = allQuestions.find(qu => qu.id === tq.questionId);
      if (!q) return;

      // LO Performance
      if (!loPerformanceMap[q.loId]) {
        loPerformanceMap[q.loId] = { total: 0, correct: 0, code: q.loId };
      }
      loPerformanceMap[q.loId].total++;
      if (tq.isCorrect) loPerformanceMap[q.loId].correct++;

      // Difficulty Performance
      diffPerformanceMap[q.difficulty].total++;
      if (tq.isCorrect) diffPerformanceMap[q.difficulty].correct++;
    });

    const loPerformance: LOPerformance[] = Object.entries(loPerformanceMap).map(([id, stats]) => {
      const percentage = (stats.correct / stats.total) * 100;
      let status: 'strong' | 'practice' | 'focus' = 'practice';
      if (percentage >= 80) status = 'strong';
      else if (percentage < 40) status = 'focus';
      
      return {
        loId: id,
        loCode: stats.code,
        correctCount: stats.correct,
        totalCount: stats.total,
        percentage,
        status
      };
    });

    const difficultyPerformance: DifficultyPerformance[] = Object.entries(diffPerformanceMap).map(([level, stats]) => ({
      level: level as DifficultyLevel,
      correctCount: stats.correct,
      totalCount: stats.total,
      percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    }));

    const result: TestResult = {
      id: generateId(),
      testSessionId: finalSession.id,
      studentId: finalSession.studentId,
      gradeId: finalSession.gradeId,
      subjectId: finalSession.subjectId,
      chapterIds: finalSession.chapterIds,
      totalQuestions,
      correctAnswers,
      score,
      accuracy: score,
      timeTaken,
      questionDetails: questions.map(tq => ({
        questionId: tq.questionId,
        status: tq.isCorrect ? 'correct' : 'incorrect',
        selectedOptionId: tq.selectedOptionId,
        correctOptionId: allQuestions.find(qu => qu.id === tq.questionId)?.correctOptionId || '',
        timeSpent: tq.timeSpent
      })),
      loPerformance,
      difficultyPerformance,
      completedAt: getCurrentTimestamp(),
    };

    await testResultStorage.save(result);
    await testSessionStorage.save(finalSession);
    
    set({ currentSession: null, currentQuestion: null, remainingTime: 0 });
    
    // Redirect handled by component
    (window as any).lastResultId = result.id;
  },

  getResults: async (studentId) => {
    const results = await testResultStorage.getAll();
    return results.filter(r => r.studentId === studentId).sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }
}));
