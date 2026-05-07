'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { UserRole, DifficultyLevel, QuestionOption } from '@/types';
import { generateId } from '@/utils/helpers';

export default function CreateQuestionPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { 
    grades, subjects, chapters, los, 
    getGrades, getSubjects, getChapters, getLOs 
  } = useMasterDataStore();
  const { createQuestion } = useQuestionsStore();

  const [formData, setFormData] = useState({
    gradeId: '',
    subjectId: '',
    chapterId: '',
    loId: '',
    text: '',
    difficulty: DifficultyLevel.MEDIUM,
    explanation: '',
    tags: '',
  });

  const [options, setOptions] = useState<QuestionOption[]>([
    { id: generateId(), text: '', isCorrect: true },
    { id: generateId(), text: '', isCorrect: false },
    { id: generateId(), text: '', isCorrect: false },
    { id: generateId(), text: '', isCorrect: false },
  ]);

  useEffect(() => {
    getGrades();
    getSubjects();
    getChapters();
    getLOs();
  }, [getGrades, getSubjects, getChapters, getLOs]);

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleSetCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const correctOptionId = options.find(o => o.isCorrect)?.id || '';
    
    await createQuestion(
      formData.text,
      options,
      correctOptionId,
      formData.loId,
      formData.chapterId,
      formData.subjectId,
      formData.gradeId,
      formData.difficulty,
      formData.explanation,
      currentUser.id,
      formData.tags.split(',').map(t => t.trim()).filter(t => t)
    );

    router.push('/teacher/questions');
  };

  const filteredSubjects = subjects.filter(s => s.gradeId === formData.gradeId);
  const filteredChapters = chapters.filter(c => c.subjectId === formData.subjectId);
  const filteredLOs = los.filter(l => l.chapterId === formData.chapterId);

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Question</h1>
          <p className="text-gray-600">Fill in the details to add a new question to the bank</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Metadata Selection */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Context</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Grade</label>
                <select 
                  className="form-input"
                  value={formData.gradeId}
                  onChange={e => setFormData({ ...formData, gradeId: e.target.value, subjectId: '', chapterId: '', loId: '' })}
                  required
                >
                  <option value="">Select Grade</option>
                  {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Subject</label>
                <select 
                  className="form-input"
                  value={formData.subjectId}
                  onChange={e => setFormData({ ...formData, subjectId: e.target.value, chapterId: '', loId: '' })}
                  disabled={!formData.gradeId}
                  required
                >
                  <option value="">Select Subject</option>
                  {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Chapter</label>
                <select 
                  className="form-input"
                  value={formData.chapterId}
                  onChange={e => setFormData({ ...formData, chapterId: e.target.value, loId: '' })}
                  disabled={!formData.subjectId}
                  required
                >
                  <option value="">Select Chapter</option>
                  {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Learning Objective (LO)</label>
                <select 
                  className="form-input"
                  value={formData.loId}
                  onChange={e => setFormData({ ...formData, loId: e.target.value })}
                  disabled={!formData.chapterId}
                  required
                >
                  <option value="">Select LO</option>
                  {filteredLOs.map(l => <option key={l.id} value={l.id}>{l.code}: {l.description.substring(0, 50)}...</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Question Content</h2>
            <div className="space-y-6">
              <div>
                <label className="form-label">Question Text</label>
                <textarea 
                  className="form-input h-32"
                  value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter the question text here..."
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="form-label">Options (Select the correct one)</label>
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center space-x-4">
                    <input 
                      type="radio" 
                      name="correct-option" 
                      checked={opt.isCorrect}
                      onChange={() => handleSetCorrect(idx)}
                      className="w-5 h-5 text-primary-600"
                    />
                    <input 
                      type="text" 
                      className={`form-input ${opt.isCorrect ? 'border-primary-500 bg-primary-50' : ''}`}
                      value={opt.text}
                      onChange={e => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="form-label">Difficulty Level</label>
                  <select 
                    className="form-input"
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                  >
                    <option value={DifficultyLevel.EASY}>Easy</option>
                    <option value={DifficultyLevel.MEDIUM}>Medium</option>
                    <option value={DifficultyLevel.HARD}>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="algebra, quadratic, basics"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Explanation / Rationale</label>
                <textarea 
                  className="form-input h-24"
                  value={formData.explanation}
                  onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain why the correct answer is correct..."
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pb-12">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="btn-secondary px-8"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary px-12"
            >
              Save Question as Draft
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
