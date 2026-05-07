'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { UserRole, QuestionStatus } from '@/types';

export default function TeacherDashboard() {
  const { currentUser } = useAuthStore();
  const { questions, getQuestions } = useQuestionsStore();

  useEffect(() => {
    getQuestions();
  }, [getQuestions]);

  const myQuestions = questions.filter((q) => q.createdBy === currentUser?.id);
  const draftQuestions = myQuestions.filter((q) => q.status === QuestionStatus.DRAFT);
  const submittedQuestions = myQuestions.filter((q) => q.status === QuestionStatus.SUBMITTED);
  const approvedQuestions = myQuestions.filter((q) => q.status === QuestionStatus.APPROVED);
  const rejectedQuestions = myQuestions.filter((q) => q.status === QuestionStatus.REJECTED);

  const stats = [
    {
      label: 'Draft Questions',
      value: draftQuestions.length,
      color: 'bg-gray-100 text-gray-600',
      icon: '📝',
    },
    {
      label: 'Under Review',
      value: submittedQuestions.length,
      color: 'bg-yellow-100 text-yellow-600',
      icon: '⏳',
    },
    {
      label: 'Approved',
      value: approvedQuestions.length,
      color: 'bg-green-100 text-green-600',
      icon: '✅',
    },
    {
      label: 'Rejected',
      value: rejectedQuestions.length,
      color: 'bg-red-100 text-red-600',
      icon: '❌',
    },
  ];

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {currentUser?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="card">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl mb-4`}>
                {stat.icon}
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/teacher/content" className="btn-primary text-center">
              Manage Curriculum
            </a>
            <a href="/teacher/questions/create" className="btn-primary text-center">
              Create Question
            </a>
            <a href="/teacher/questions/bulk-upload" className="btn-primary text-center">
              Bulk Upload
            </a>
            <a href="/teacher/questions" className="btn-secondary text-center">
              View Question Bank
            </a>
            <a href="/teacher/reviews" className="btn-secondary text-center">
              Review Questions
            </a>
          </div>
        </div>

        {/* My Questions Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions by Status */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Questions by Status</h2>
            <div className="space-y-3">
              {[
                { status: 'Draft', count: draftQuestions.length, color: 'text-gray-600' },
                { status: 'Under Review', count: submittedQuestions.length, color: 'text-yellow-600' },
                { status: 'Approved', count: approvedQuestions.length, color: 'text-green-600' },
                { status: 'Rejected', count: rejectedQuestions.length, color: 'text-red-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className={`font-medium ${item.color}`}>{item.status}</span>
                  <span className="text-gray-900 font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-2 text-sm">
              {myQuestions.length === 0 ? (
                <p className="text-gray-600">No questions created yet</p>
              ) : (
                myQuestions.slice(0, 5).map((q) => (
                  <div key={q.id} className="py-2 border-b border-gray-200 text-gray-600">
                    <p className="truncate">{q.text}</p>
                    <span className={`text-xs font-medium ${
                      q.status === 'approved' ? 'text-green-600' :
                      q.status === 'rejected' ? 'text-red-600' :
                      q.status === 'submitted' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
