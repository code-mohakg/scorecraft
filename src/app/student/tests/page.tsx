'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useTestStore } from '@/stores/testStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { UserRole } from '@/types';

export default function TestConfigPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { 
    grades, subjects, chapters, 
    getGrades, getSubjects, getChapters 
  } = useMasterDataStore();
  const { startSession } = useTestStore();
  const { getQuestions, questions } = useQuestionsStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    getGrades();
    getSubjects();
    getChapters();
    getQuestions();
  }, [getGrades, getSubjects, getChapters, getQuestions]);

  const studentGradeId = currentUser?.gradeIds?.[0] || '';
  const filteredSubjects = subjects.filter(s => s.gradeId === studentGradeId);
  const filteredChapters = chapters.filter(c => c.subjectId === selectedSubjectId);

  const toggleChapter = (id: string) => {
    setSelectedChapterIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleStart = async () => {
    if (!currentUser || !studentGradeId || !selectedSubjectId || selectedChapterIds.length === 0) {
      alert('Please select a subject and at least one chapter');
      return;
    }

    const session = await startSession(
      currentUser.id,
      studentGradeId,
      selectedSubjectId,
      selectedChapterIds,
      duration
    );

    if (session) {
      router.push(`/student/tests/${session.id}`);
    }
  };

  // Count available approved questions for selection
  const getAvailableCount = () => {
    return questions.filter(q => 
      q.status === 'approved' && 
      q.subjectId === selectedSubjectId && 
      selectedChapterIds.includes(q.chapterId)
    ).length;
  };

  return (
    <DashboardLayout requiredRole={UserRole.STUDENT}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configure Your Test</h1>
          <p className="text-gray-600">Select topics and set your preferences for the adaptive test</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">1. Choose Subject</h2>
              <div className="space-y-3">
                {filteredSubjects.length === 0 ? (
                  <p className="text-gray-500 italic">No subjects assigned to your grade</p>
                ) : (
                  filteredSubjects.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => { setSelectedSubjectId(s.id); setSelectedChapterIds([]); }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        selectedSubjectId === s.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-primary-200'
                      }`}
                    >
                      <h3 className="font-bold">{s.name}</h3>
                      <p className="text-sm text-gray-500">{s.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">2. Select Duration</h2>
              <div className="grid grid-cols-4 gap-3">
                {[10, 20, 30, 45, 60].map(min => (
                  <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`py-3 rounded-lg font-bold border-2 transition ${
                      duration === min ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-100 hover:border-primary-200'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4">3. Select Chapters</h2>
              {!selectedSubjectId ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                  Select a subject first
                </div>
              ) : filteredChapters.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                  No chapters found for this subject
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {filteredChapters.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => toggleChapter(c.id)}
                      className={`p-3 rounded-lg border flex items-center space-x-3 cursor-pointer transition ${
                        selectedChapterIds.includes(c.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                        selectedChapterIds.includes(c.id) ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                      }`}>
                        {selectedChapterIds.includes(c.id) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Start Button Area */}
        <div className="card bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Summary</h3>
            <p className="text-gray-400 text-sm">
              {selectedSubjectId ? subjects.find(s => s.id === selectedSubjectId)?.name : 'No subject'} • 
              {' '}{selectedChapterIds.length} Chapters • 
              {' '}{duration} Minutes
            </p>
            {selectedSubjectId && (
              <p className={`text-xs mt-2 font-bold ${getAvailableCount() < 5 ? 'text-red-400' : 'text-green-400'}`}>
                {getAvailableCount()} approved questions available
              </p>
            )}
          </div>
          <button 
            onClick={handleStart}
            disabled={!selectedSubjectId || selectedChapterIds.length === 0 || getAvailableCount() < 5}
            className={`px-12 py-4 rounded-xl font-bold text-lg transition shadow-xl ${
              !selectedSubjectId || selectedChapterIds.length === 0 || getAvailableCount() < 5
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            Start Adaptive Test
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
