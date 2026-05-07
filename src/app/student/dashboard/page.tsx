'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import Link from 'next/link';
import { useTestStore } from '@/stores/testStore';
import { useState } from 'react';

export default function StudentDashboard() {
  const { currentUser } = useAuthStore();

  const { getResults } = useTestStore();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (currentUser) {
        const data = await getResults(currentUser.id);
        setResults(data);
      }
    };
    fetchResults();
  }, [currentUser, getResults]);

  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) 
    : '-';
  
  const avgAccuracy = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / results.length) 
    : '-';

  const stats = [
    {
      label: 'Tests Taken',
      value: results.length.toString(),
      color: 'bg-blue-100 text-blue-600',
      icon: '📝',
    },
    {
      label: 'Average Score',
      value: avgScore === '-' ? '-' : `${avgScore}%`,
      color: 'bg-green-100 text-green-600',
      icon: '⭐',
    },
    {
      label: 'Accuracy',
      value: avgAccuracy === '-' ? '-' : `${avgAccuracy}%`,
      color: 'bg-purple-100 text-purple-600',
      icon: '🎯',
    },
    {
      label: 'Strong Topics',
      value: results.length > 0 ? results[0].loPerformance.filter((l: any) => l.status === 'strong').length : '0',
      color: 'bg-orange-100 text-orange-600',
      icon: '💪',
    },
  ];

  return (
    <DashboardLayout requiredRole={UserRole.STUDENT}>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
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

        {/* Main CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Test Your Knowledge?</h2>
          <p className="mb-6 text-blue-100">
            Take an adaptive test that adjusts to your level and provides detailed performance insights.
          </p>
          <Link
            href="/student/tests"
            className="inline-block px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-blue-50 transition"
          >
            Start a New Test
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold mb-2">Adaptive Testing</h3>
            <p className="text-gray-600 text-sm">
              Experience personalized difficulty levels that adapt based on your performance
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-bold mb-2">Detailed Analytics</h3>
            <p className="text-gray-600 text-sm">
              Get comprehensive feedback on your performance by topic and difficulty level
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="font-bold mb-2">Track Progress</h3>
            <p className="text-gray-600 text-sm">
              Monitor your improvement over time with historical test results and trends
            </p>
          </div>
        </div>

        {/* Test History */}
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Your Test History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Subject</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Score</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Accuracy</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      You haven't taken any tests yet. Start your first test above!
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(r.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        Assessment
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${r.score >= 80 ? 'text-green-600' : r.score < 50 ? 'text-red-600' : 'text-orange-600'}`}>
                          {Math.round(r.score)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Math.round(r.accuracy)}%
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/student/results/${r.id}`} className="text-primary-600 font-bold hover:underline text-sm">
                          View Analysis
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
