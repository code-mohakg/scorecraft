'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { UserRole, QuestionStatus, ReviewStatus, DifficultyLevel } from '@/types';

export default function PeerReviewPage() {
  const { currentUser } = useAuthStore();
  const { questions, getQuestions, approveQuestion, rejectQuestion, updateQuestion } = useQuestionsStore();
  const { grades, subjects, chapters, getGrades, getSubjects, getChapters } = useMasterDataStore();
  
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    getQuestions();
    getGrades();
    getSubjects();
    getChapters();
  }, [getQuestions, getGrades, getSubjects, getChapters]);

  // Questions to review: Status is SUBMITTED and NOT created by current user
  const questionsToReview = questions.filter(
    q => q.status === QuestionStatus.SUBMITTED && q.createdBy !== currentUser?.id
  );

  const handleReview = async (status: 'approve' | 'reject' | 'changes') => {
    if (!selectedQuestion) return;

    if (status === 'approve') {
      await approveQuestion(selectedQuestion.id);
    } else if (status === 'reject') {
      await rejectQuestion(selectedQuestion.id);
    } else if (status === 'changes') {
      await updateQuestion(selectedQuestion.id, { status: QuestionStatus.DRAFT });
      // In a real app, we'd save the comment to a review record
    }

    setSelectedQuestion(null);
    setReviewComments('');
  };

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Peer Review Queue</h1>
          <p className="text-gray-600">Review questions submitted by your colleagues</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Questions */}
          <div className="lg:col-span-1 space-y-4 h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {questionsToReview.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-gray-500">No questions pending review</p>
              </div>
            ) : (
              questionsToReview.map(q => (
                <div 
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`card cursor-pointer p-4 transition border-2 ${
                    selectedQuestion?.id === q.id ? 'border-primary-500 bg-primary-50' : 'border-transparent'
                  }`}
                >
                  <p className="text-sm font-medium line-clamp-2 mb-2">{q.text}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{subjects.find(s => s.id === q.subjectId)?.name}</span>
                    <span className="font-bold uppercase">{q.difficulty}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Review Panel */}
          <div className="lg:col-span-2">
            {!selectedQuestion ? (
              <div className="card h-full flex items-center justify-center text-gray-400">
                <p>Select a question from the list to start reviewing</p>
              </div>
            ) : (
              <div className="card space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Reviewing Question</h2>
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <p className="text-lg text-gray-900 mb-6">{selectedQuestion.text}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {selectedQuestion.options.map((opt: any) => (
                        <div 
                          key={opt.id} 
                          className={`p-3 rounded border ${opt.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200'}`}
                        >
                          <span className="font-bold mr-2">{opt.isCorrect ? '✓' : '•'}</span>
                          {opt.text}
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-gray-600 bg-white p-4 rounded border border-gray-200">
                      <p className="font-bold mb-1">Explanation:</p>
                      <p>{selectedQuestion.explanation}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="p-3 bg-gray-100 rounded">
                      <span className="block text-gray-500">Subject</span>
                      <span className="font-bold">{subjects.find(s => s.id === selectedQuestion.subjectId)?.name}</span>
                    </div>
                    <div className="p-3 bg-gray-100 rounded">
                      <span className="block text-gray-500">Chapter</span>
                      <span className="font-bold">{chapters.find(c => c.id === selectedQuestion.chapterId)?.name}</span>
                    </div>
                    <div className="p-3 bg-gray-100 rounded">
                      <span className="block text-gray-500">Difficulty</span>
                      <span className="font-bold uppercase">{selectedQuestion.difficulty}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="form-label">Review Comments (Required for rejection/changes)</label>
                    <textarea 
                      className="form-input h-24"
                      value={reviewComments}
                      onChange={e => setReviewComments(e.target.value)}
                      placeholder="Enter your feedback here..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button 
                      onClick={() => handleReview('changes')}
                      className="px-6 py-2 border-2 border-orange-500 text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition"
                    >
                      Request Changes
                    </button>
                    <button 
                      onClick={() => handleReview('reject')}
                      className="px-6 py-2 border-2 border-red-500 text-red-600 rounded-lg font-bold hover:bg-red-50 transition"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleReview('approve')}
                      className="btn-primary px-10"
                    >
                      Approve Question
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
