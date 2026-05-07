'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { UserRole } from '@/types';

export default function AdminDashboard() {
  const { currentUser } = useAuthStore();
  const { grades, subjects, chapters, getGrades, getSubjects, getChapters } =
    useMasterDataStore();
  const { questions, getQuestions } = useQuestionsStore();

  useEffect(() => {
    getGrades();
    getSubjects();
    getChapters();
    getQuestions();
  }, [getGrades, getSubjects, getChapters, getQuestions]);

  const stats = [
    {
      label: 'Total Grades',
      value: grades.length,
      color: 'bg-blue-100 text-blue-600',
      icon: '📚',
    },
    {
      label: 'Total Subjects',
      value: subjects.length,
      color: 'bg-green-100 text-green-600',
      icon: '📖',
    },
    {
      label: 'Total Chapters',
      value: chapters.length,
      color: 'bg-purple-100 text-purple-600',
      icon: '📝',
    },
    {
      label: 'Total Questions',
      value: questions.length,
      color: 'bg-orange-100 text-orange-600',
      icon: '❓',
    },
  ];

  return (
    <DashboardLayout requiredRole={UserRole.ADMIN}>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {currentUser?.name}!</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="btn-primary text-center"
            >
              Manage Users
            </a>
            <a
              href="/admin/master-data"
              className="btn-primary text-center"
            >
              Create Grades & Subjects
            </a>
            <a
              href="/admin/analytics"
              className="btn-secondary text-center"
            >
              View Analytics
            </a>
            <a
              href="/admin/reports"
              className="btn-secondary text-center"
            >
              Generate Reports
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Active Grades</span>
              <span className="font-bold text-gray-900">{grades.filter(g => g.status === 'active').length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Active Subjects</span>
              <span className="font-bold text-gray-900">{subjects.filter(s => s.status === 'active').length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Approved Questions</span>
              <span className="font-bold text-gray-900">{questions.filter(q => q.status === 'approved').length}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
