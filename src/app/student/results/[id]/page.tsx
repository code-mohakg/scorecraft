'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useTestStore } from '@/stores/testStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { UserRole, TestResult, DifficultyLevel } from '@/types';
import Link from 'next/link';

export default function TestResultPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentUser } = useAuthStore();
  const { getResults } = useTestStore();
  const { subjects, getSubjects } = useMasterDataStore();
  const { questions, getQuestions } = useQuestionsStore();

  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      await getSubjects();
      await getQuestions();
      if (currentUser) {
        const allResults = await getResults(currentUser.id);
        const currentResult = allResults.find(r => r.id === id);
        if (currentResult) {
          setResult(currentResult);
        }
      }
    };
    fetchData();
  }, [id, currentUser, getResults, getSubjects, getQuestions]);

  if (!result) {
    return (
      <DashboardLayout requiredRole={UserRole.STUDENT}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const subject = subjects.find(s => s.id === result.subjectId);

  return (
    <DashboardLayout requiredRole={UserRole.STUDENT}>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Analysis</h1>
            <p className="text-gray-600">{subject?.name} Assessment • {new Date(result.completedAt).toLocaleDateString()}</p>
          </div>
          <Link href="/student/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center bg-primary-600 text-white">
            <p className="text-blue-100 text-sm mb-1 uppercase font-bold tracking-wider">Your Score</p>
            <p className="text-5xl font-bold">{Math.round(result.score)}%</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-500 text-sm mb-1 uppercase font-bold tracking-wider">Accuracy</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(result.accuracy)}%</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-500 text-sm mb-1 uppercase font-bold tracking-wider">Correct</p>
            <p className="text-3xl font-bold text-green-600">{result.correctAnswers} / {result.totalQuestions}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-500 text-sm mb-1 uppercase font-bold tracking-wider">Time Spent</p>
            <p className="text-3xl font-bold text-gray-900">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LO Performance */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Topic Performance</h2>
            <div className="space-y-6">
              {result.loPerformance.map(lo => (
                <div key={lo.loId}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800">{lo.loCode}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      lo.status === 'strong' ? 'bg-green-100 text-green-700' :
                      lo.status === 'focus' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {lo.status}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        lo.status === 'strong' ? 'bg-green-500' :
                        lo.status === 'focus' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${lo.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {lo.correctCount} correct out of {lo.totalCount} questions
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Difficulty Insights</h2>
            <div className="space-y-4">
              {result.difficultyPerformance.map(dp => (
                <div key={dp.level} className="flex items-center gap-4">
                  <div className="w-20 font-bold uppercase text-xs text-gray-500">{dp.level}</div>
                  <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        dp.level === DifficultyLevel.HARD ? 'bg-red-400' :
                        dp.level === DifficultyLevel.MEDIUM ? 'bg-orange-400' :
                        'bg-green-400'
                      }`}
                      style={{ width: `${dp.percentage}%` }}
                    ></div>
                    <span className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-gray-600">
                      {Math.round(dp.percentage)}%
                    </span>
                  </div>
                  <div className="w-16 text-right text-xs font-bold text-gray-400">
                    {dp.correctCount}/{dp.totalCount}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-bold">Recommendation:</span> Based on your performance, you should focus more on 
                {result.loPerformance.filter(l => l.status === 'focus').map(l => l.loCode).join(', ') || ' strengthening your concepts in current topics'} 
                at the {result.difficultyPerformance.sort((a,b) => a.percentage - b.percentage)[0].level} difficulty level.
              </p>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Question-by-Question Analysis</h2>
          <div className="space-y-4">
            {result.questionDetails.map((detail, idx) => {
              const q = questions.find(question => question.id === detail.questionId);
              return (
                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-400">Q{idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q?.difficulty === DifficultyLevel.HARD ? 'bg-red-100 text-red-600' :
                        q?.difficulty === DifficultyLevel.MEDIUM ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {q?.difficulty}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      detail.status === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {detail.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-900 font-medium mb-4">{q?.text}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      {q?.options.map(opt => (
                        <div 
                          key={opt.id} 
                          className={`p-3 rounded-lg border flex justify-between items-center ${
                            opt.id === q.correctOptionId ? 'bg-green-50 border-green-200 text-green-800' :
                            opt.id === detail.selectedOptionId && detail.status === 'incorrect' ? 'bg-red-50 border-red-200 text-red-800' :
                            'bg-white border-gray-100 text-gray-500'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {opt.id === q.correctOptionId && <span className="text-xs font-bold">CORRECT</span>}
                          {opt.id === detail.selectedOptionId && detail.status === 'incorrect' && <span className="text-xs font-bold">YOUR PICK</span>}
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-sm">
                      <p className="font-bold text-blue-900 mb-1">Explanation:</p>
                      <p className="text-blue-800">{q?.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
