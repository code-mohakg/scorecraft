'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { UserRole, QuestionStatus, DifficultyLevel } from '@/types';
import Link from 'next/link';

export default function TeacherQuestionsPage() {
  const { currentUser } = useAuthStore();
  const { questions, getQuestions, deleteQuestion, submitQuestion } = useQuestionsStore();
  const { grades, subjects, chapters, getGrades, getSubjects, getChapters } = useMasterDataStore();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    getQuestions();
    getGrades();
    getSubjects();
    getChapters();
  }, [getQuestions, getGrades, getSubjects, getChapters]);

  const myQuestions = questions.filter(q => q.createdBy === currentUser?.id);
  const filteredQuestions = filterStatus === 'all' 
    ? myQuestions 
    : myQuestions.filter(q => q.status === filterStatus);

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case QuestionStatus.APPROVED: return 'bg-green-100 text-green-800';
      case QuestionStatus.REJECTED: return 'bg-red-100 text-red-800';
      case QuestionStatus.SUBMITTED: return 'bg-yellow-100 text-yellow-800';
      case QuestionStatus.UNDER_REVIEW: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Question Bank</h1>
            <p className="text-gray-600">Manage and track your question submissions</p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/questions/bulk-upload" className="btn-secondary">
              Bulk Upload
            </Link>
            <Link href="/teacher/questions/create" className="btn-primary">
              + New Question
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['all', ...Object.values(QuestionStatus)].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filterStatus === status 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Question List */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Question</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Topic</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Difficulty</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No questions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q) => {
                    const grade = grades.find(g => g.id === q.gradeId);
                    const subject = subjects.find(s => s.id === q.subjectId);
                    const chapter = chapters.find(c => c.id === q.chapterId);
                    
                    return (
                      <tr key={q.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 font-medium line-clamp-2 max-w-xs">{q.text}</p>
                          <span className="text-xs text-gray-500">ID: {q.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600">
                            <span className="block">{grade?.name}</span>
                            <span className="block font-bold">{subject?.name}</span>
                            <span className="block italic">{chapter?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            q.difficulty === DifficultyLevel.HARD ? 'text-red-600' :
                            q.difficulty === DifficultyLevel.MEDIUM ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {q.difficulty.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(q.status)}`}>
                            {q.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            {q.status === QuestionStatus.DRAFT && (
                              <>
                                <button 
                                  onClick={async () => await submitQuestion(q.id)}
                                  className="text-xs text-green-600 font-bold hover:underline"
                                >
                                  Submit
                                </button>
                                <Link 
                                  href={`/teacher/questions/edit/${q.id}`}
                                  className="text-xs text-blue-600 font-bold hover:underline"
                                >
                                  Edit
                                </Link>
                              </>
                            )}
                            <button 
                              onClick={async () => { if(confirm('Are you sure?')) await deleteQuestion(q.id); }}
                              className="text-xs text-red-600 font-bold hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
