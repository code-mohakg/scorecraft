'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { initializeAuth } = useAuthStore.getState();
    initializeAuth();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
      };
      router.push(roleRoutes[currentUser.role] || '/');
    }
  }, [isAuthenticated, currentUser, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ScoreCraft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-blue-600">
      {/* Navigation */}
      <nav className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-primary-600">
                SC
              </div>
              <span className="text-white text-xl font-bold">ScoreCraft</span>
            </div>
            <div className="hidden md:flex space-x-8 text-white text-sm">
              <a href="#features" className="hover:text-blue-100 transition">Features</a>
              <a href="#about" className="hover:text-blue-100 transition">About</a>
              <a href="#contact" className="hover:text-blue-100 transition">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to ScoreCraft
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              An innovative adaptive testing platform designed for educational institutions. Create comprehensive question banks, conduct intelligent assessments, and gain actionable insights into student performance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login?role=student"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg"
              >
                Student Login
              </Link>
              <Link
                href="/login?role=teacher"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
              >
                Teacher Login
              </Link>
            </div>
          </div>

          {/* Right Column - Feature Highlights */}
          <div className="grid gap-6">
            <div className="bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-20 rounded-xl p-6 text-white hover:bg-opacity-20 transition">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-lg mb-2">Adaptive Testing</h3>
              <p className="text-blue-100 text-sm">Intelligent question selection that adjusts difficulty based on student performance</p>
            </div>

            <div className="bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-20 rounded-xl p-6 text-white hover:bg-opacity-20 transition">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-lg mb-2">Deep Analytics</h3>
              <p className="text-blue-100 text-sm">Comprehensive performance tracking by topic, difficulty level, and time spent</p>
            </div>

            <div className="bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-20 rounded-xl p-6 text-white hover:bg-opacity-20 transition">
              <div className="text-3xl mb-3">✍️</div>
              <h3 className="font-bold text-lg mb-2">Question Bank Management</h3>
              <p className="text-blue-100 text-sm">Easy creation, organization, and peer review of questions across subjects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-xl p-8 text-white text-center">
          <p className="mb-4">Are you an administrator?</p>
          <Link
            href="/login?role=admin"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Admin Login
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black bg-opacity-30 border-t border-white border-opacity-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-white text-opacity-70 text-sm">
          <p>&copy; 2024 ScoreCraft. All rights reserved. Local development version.</p>
        </div>
      </footer>
    </div>
  );
}
