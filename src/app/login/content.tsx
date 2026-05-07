'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { UserRole, User } from '@/types';
import { generateId, getCurrentTimestamp, validateEmail } from '@/utils/helpers';
import { userStorage } from '@/lib/storage';
import Link from 'next/link';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(
    (searchParams.get('role') as UserRole) || UserRole.STUDENT
  );
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate login/signup
      await new Promise((resolve) => setTimeout(resolve, 500));

      const allUsers = await userStorage.getAll();
      let user = allUsers.find((u) => u.email === email && u.role === role);

      if (!user) {
        if (!isSignUp) {
          setError(`No account found. Please sign up first.`);
          setIsLoading(false);
          return;
        }

        // Create new user for demo purposes
        user = {
          id: generateId(),
          email,
          name: name || email.split('@')[0],
          role,
          gradeIds: [],
          subjectIds: [],
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        await userStorage.save(user);
      }

      await login(user);

      // Redirect based on role
      const roleRoutes: Record<UserRole, string> = {
        [UserRole.ADMIN]: '/admin/dashboard',
        [UserRole.TEACHER]: '/teacher/dashboard',
        [UserRole.STUDENT]: '/student/dashboard',
      };

      router.push(roleRoutes[role]);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogins = [
    { email: 'admin@scorecraft.com', name: 'Admin User' },
    { email: 'teacher@scorecraft.com', name: 'Teacher User' },
    { email: 'student@scorecraft.com', name: 'Student User' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-4">
            <span className="text-2xl font-bold text-primary-600">SC</span>
          </div>
          <h1 className="text-white text-3xl font-bold">ScoreCraft</h1>
          <p className="text-blue-100 mt-2">Adaptive Testing Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          {/* Role Selector */}
          <div className="mb-6">
            <label className="form-label">Select Role</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                setError('');
              }}
              disabled={isLoading}
              className="form-input"
            >
              <option value={UserRole.STUDENT}>👨‍🎓 Student</option>
              <option value={UserRole.TEACHER}>👨‍🏫 Teacher</option>
              <option value={UserRole.ADMIN}>⚙️ Administrator</option>
            </select>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                placeholder="you@example.com"
                className="form-input"
                required
              />
            </div>

            {/* Name (Sign Up) */}
            {isSignUp && (
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                  placeholder="Your Name"
                  className="form-input"
                  required={isSignUp}
                />
              </div>
            )}

            {/* Error Message */}
            {error && <div className="alert alert-error mb-4">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mb-4 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <span className="spinner w-4 h-4 mr-2"></span>
                  Loading...
                </>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>

            {/* Toggle Sign Up */}
            <div className="text-center text-sm">
              {isSignUp ? (
                <>
                  Have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                      setName('');
                    }}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                    }}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">Demo Accounts</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Demo Login Buttons */}
          <div className="space-y-2">
            {demoLogins.map((demo) => (
              <button
                key={demo.email}
                onClick={() => {
                  setEmail(demo.email);
                  setRole(
                    demo.email.includes('admin')
                      ? UserRole.ADMIN
                      : demo.email.includes('teacher')
                        ? UserRole.TEACHER
                        : UserRole.STUDENT
                  );
                }}
                className="w-full btn-secondary text-sm py-2"
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-white hover:text-blue-100 text-sm transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
