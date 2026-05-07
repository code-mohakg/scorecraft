'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { UserRole, Grade, Subject, Chapter, LearningObjective } from '@/types';

export default function MasterDataPage() {
  const {
    grades, subjects, chapters, los,
    getGrades, getSubjects, getChapters, getLOs,
    addGrade, updateGrade, deleteGrade,
    addSubject, updateSubject, deleteSubject,
    addChapter, updateChapter, deleteChapter,
    addLO, updateLO, deleteLO
  } = useMasterDataStore();

  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'grade' | 'subject' | 'chapter' | 'lo'>('grade');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', code: '' });

  useEffect(() => {
    getGrades();
    getSubjects();
    getChapters();
    getLOs();
  }, [getGrades, getSubjects, getChapters, getLOs]);

  const filteredSubjects = subjects.filter(s => s.gradeId === selectedGradeId);
  const filteredChapters = chapters.filter(c => c.subjectId === selectedSubjectId);
  const filteredLOs = los.filter(l => l.chapterId === selectedChapterId);

  const openModal = (type: 'grade' | 'subject' | 'chapter' | 'lo', id: string | null = null) => {
    setModalType(type);
    setEditingId(id);
    if (id) {
      let item: any;
      if (type === 'grade') item = grades.find(g => g.id === id);
      else if (type === 'subject') item = subjects.find(s => s.id === id);
      else if (type === 'chapter') item = chapters.find(c => c.id === id);
      else if (type === 'lo') item = los.find(l => l.id === id);
      
      setFormData({ 
        name: item?.name || '', 
        description: item?.description || '', 
        code: item?.code || '' 
      });
    } else {
      setFormData({ name: '', description: '', code: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (modalType === 'grade') {
      if (editingId) await updateGrade(editingId, formData.name, formData.description);
      else await addGrade(formData.name, formData.description);
    } else if (modalType === 'subject') {
      if (editingId) await updateSubject(editingId, formData.name, formData.description);
      else await addSubject(selectedGradeId, formData.name, formData.description);
    } else if (modalType === 'chapter') {
      if (editingId) await updateChapter(editingId, formData.name, formData.description);
      else await addChapter(selectedSubjectId, formData.name, formData.description);
    } else if (modalType === 'lo') {
      if (editingId) await updateLO(editingId, formData.code, formData.description);
      else await addLO(selectedChapterId, formData.code, formData.description);
    }
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout requiredRole={UserRole.ADMIN}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Master Data Management</h1>
            <p className="text-gray-600">Configure Grades, Subjects, Chapters, and Learning Objectives</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Grades Column */}
          <div className="card h-[calc(100vh-250px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Grades</h2>
              <button onClick={() => openModal('grade')} className="text-primary-600 hover:text-primary-700 font-bold text-xl">+</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {grades.map(grade => (
                <div 
                  key={grade.id}
                  onClick={() => {
                    setSelectedGradeId(grade.id);
                    setSelectedSubjectId('');
                    setSelectedChapterId('');
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition flex justify-between items-center ${selectedGradeId === grade.id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50 border border-transparent'}`}
                >
                  <span className="font-medium">{grade.name}</span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100">
                     <button onClick={(e) => { e.stopPropagation(); openModal('grade', grade.id); }} className="text-xs text-blue-600">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Column */}
          <div className="card h-[calc(100vh-250px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Subjects</h2>
              {selectedGradeId && (
                <button onClick={() => openModal('subject')} className="text-primary-600 hover:text-primary-700 font-bold text-xl">+</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {!selectedGradeId ? (
                <p className="text-gray-400 text-sm text-center mt-10">Select a grade first</p>
              ) : filteredSubjects.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-10">No subjects found</p>
              ) : (
                filteredSubjects.map(subject => (
                  <div 
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubjectId(subject.id);
                      setSelectedChapterId('');
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition flex justify-between items-center ${selectedSubjectId === subject.id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <span className="font-medium">{subject.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); openModal('subject', subject.id); }} className="text-xs text-blue-600">Edit</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chapters Column */}
          <div className="card h-[calc(100vh-250px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Chapters</h2>
              {selectedSubjectId && (
                <button onClick={() => openModal('chapter')} className="text-primary-600 hover:text-primary-700 font-bold text-xl">+</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {!selectedSubjectId ? (
                <p className="text-gray-400 text-sm text-center mt-10">Select a subject first</p>
              ) : filteredChapters.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-10">No chapters found</p>
              ) : (
                filteredChapters.map(chapter => (
                  <div 
                    key={chapter.id}
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={`p-3 rounded-lg cursor-pointer transition flex justify-between items-center ${selectedChapterId === chapter.id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <span className="font-medium">{chapter.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); openModal('chapter', chapter.id); }} className="text-xs text-blue-600">Edit</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LOs Column */}
          <div className="card h-[calc(100vh-250px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Learning Objectives</h2>
              {selectedChapterId && (
                <button onClick={() => openModal('lo')} className="text-primary-600 hover:text-primary-700 font-bold text-xl">+</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {!selectedChapterId ? (
                <p className="text-gray-400 text-sm text-center mt-10">Select a chapter first</p>
              ) : filteredLOs.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-10">No LOs found</p>
              ) : (
                filteredLOs.map(lo => (
                  <div 
                    key={lo.id}
                    className="p-3 rounded-lg bg-gray-50 border border-gray-100 flex justify-between items-start"
                  >
                    <div>
                      <span className="text-xs font-bold text-primary-600 block">{lo.code}</span>
                      <p className="text-sm text-gray-700">{lo.description}</p>
                    </div>
                    <button onClick={() => openModal('lo', lo.id)} className="text-xs text-blue-600">Edit</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? 'Edit' : 'Add New'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h2>
              <div className="space-y-4">
                {modalType === 'lo' ? (
                  <>
                    <div>
                      <label className="form-label">LO Code</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formData.code} 
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g. LO-MTH-1.1"
                      />
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-input h-32" 
                        value={formData.description} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="form-label">Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-input h-24" 
                        value={formData.description} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSave} className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
