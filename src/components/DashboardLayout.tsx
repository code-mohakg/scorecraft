'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function DashboardLayout({
  children,
  requiredRole,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && currentUser?.role !== requiredRole) {
      router.push('/');
    }
  }, [isAuthenticated, currentUser, requiredRole, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const navigationItems = {
    [UserRole.ADMIN]: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
      { label: 'Manage Users', href: '/admin/users', icon: '👥' },
      { label: 'Grades & Subjects', href: '/admin/master-data', icon: '📚' },
      { label: 'Platform Stats', href: '/admin/analytics', icon: '📈' },
    ],
    [UserRole.TEACHER]: [
      { label: 'Dashboard', href: '/teacher/dashboard', icon: '📊' },
      { label: 'My Questions', href: '/teacher/questions', icon: '❓' },
      { label: 'Review Queue', href: '/teacher/reviews', icon: '✅' },
      { label: 'Student Performance', href: '/teacher/analytics', icon: '📈' },
    ],
    [UserRole.STUDENT]: [
      { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
      { label: 'Take Test', href: '/student/tests', icon: '🎯' },
      { label: 'Test History', href: '/student/history', icon: '📜' },
      { label: 'Performance', href: '/student/performance', icon: '📈' },
    ],
  };

  const nav = navigationItems[currentUser.role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-white">
                SC
              </div>
              <span className="text-xl font-bold text-gray-900">ScoreCraft</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{currentUser.name}</p>
                <p className="text-gray-500 capitalize">{currentUser.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-full">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <nav className="p-6 space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
