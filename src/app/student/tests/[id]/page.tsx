'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTestStore } from '@/stores/testStore';
import { useAuthStore } from '@/stores/authStore';
import { DifficultyLevel } from '@/types';

export default function TestInterfacePage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentUser } = useAuthStore();
  const { 
    currentSession, 
    currentQuestion, 
    remainingTime, 
    submitAnswer, 
    tick 
  } = useTestStore();

  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentSession && !isSubmitting) {
      router.push('/student/dashboard');
    }
  }, [currentSession, router, isSubmitting]);

  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  const handleSubmit = async () => {
    if (!selectedOptionId) return;
    
    setIsSubmitting(true);
    await submitAnswer(selectedOptionId);
    setSelectedOptionId('');
    
    // The finishTest call inside submitAnswer might have redirected or set lastResultId
    const lastResultId = (window as any).lastResultId;
    if (lastResultId) {
      router.push(`/student/results/${lastResultId}`);
      delete (window as any).lastResultId;
    } else {
      setIsSubmitting(false);
    }
  };

  if (!currentSession || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="spinner mb-4 border-t-white"></div>
          <p>Initializing your test...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Test Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-white">
              SC
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Adaptive Assessment</h1>
              <p className="text-xs text-gray-500">Question {currentSession.questions.length + 1}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className={`text-2xl font-mono font-bold ${remainingTime < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
              {formatTime(remainingTime)}
            </div>
            <button 
              onClick={() => { if(confirm('Are you sure you want to quit? Your progress will be lost.')) router.push('/student/dashboard'); }}
              className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Quit
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-200">
        <div 
          className="h-full bg-primary-600 transition-all duration-500" 
          style={{ width: `${(currentSession.questions.length / 20) * 100}%` }} // Mock 20 questions target
        ></div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
        <div className="space-y-10">
          {/* Difficulty Badge */}
          <div className="flex justify-start">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentQuestion.difficulty === DifficultyLevel.HARD ? 'bg-red-100 text-red-700' :
              currentQuestion.difficulty === DifficultyLevel.MEDIUM ? 'bg-orange-100 text-orange-700' :
              'bg-green-100 text-green-700'
            }`}>
              {currentQuestion.difficulty} Level
            </span>
          </div>

          {/* Question Text */}
          <div className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed">
            {currentQuestion.text}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <div 
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className={`group p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center space-x-4 ${
                  selectedOptionId === option.id 
                    ? 'border-primary-500 bg-primary-50 shadow-md transform scale-[1.02]' 
                    : 'border-white bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition ${
                  selectedOptionId === option.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={`text-lg ${selectedOptionId === option.id ? 'text-primary-900 font-medium' : 'text-gray-700'}`}>
                  {option.text}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-8">
            <button
              onClick={handleSubmit}
              disabled={!selectedOptionId || isSubmitting}
              className={`px-12 py-4 rounded-xl font-bold text-lg transition shadow-lg ${
                !selectedOptionId || isSubmitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {isSubmitting ? 'Next...' : 'Submit & Continue'}
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-400">
        All answers are final. You cannot go back to previous questions in adaptive mode.
      </footer>
    </div>
  );
}
