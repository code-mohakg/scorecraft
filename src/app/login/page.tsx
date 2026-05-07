'use client';

import { Suspense } from 'react';
import LoginContent from './content';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="spinner mx-auto mb-4 border-white"></div>
        <p className="text-white">Loading ScoreCraft...</p>
      </div>
    </div>
  );
}

