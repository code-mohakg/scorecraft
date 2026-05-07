'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { UserRole, DifficultyLevel, QuestionOption } from '@/types';
import { generateId } from '@/utils/helpers';
import Papa from 'papaparse';

export default function BulkUploadPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { 
    grades, subjects, chapters, los, 
    getGrades, getSubjects, getChapters, getLOs 
  } = useMasterDataStore();
  const { createQuestion } = useQuestionsStore();

  const [selectedContext, setSelectedContext] = useState({
    gradeId: '',
    subjectId: '',
    chapterId: '',
  });

  const [csvData, setCsvData] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getGrades();
    getSubjects();
    getChapters();
    getLOs();
  }, [getGrades, getSubjects, getChapters, getLOs]);

  const handleUpload = async () => {
    if (!csvData || !selectedContext.gradeId || !selectedContext.subjectId || !selectedContext.chapterId) {
      alert('Please select the context and provide CSV data');
      return;
    }

    setIsProcessing(true);
    
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const rows = results.data;
        const uploadResults = {
          total: rows.length,
          success: 0,
          failed: 0,
          errors: [] as any[]
        };

        const processRows = async () => {
          for (let i = 0; i < rows.length; i++) {
            const rowData = rows[i];
            try {
              // Validate required fields
              const required = ['text', 'option1', 'option2', 'option3', 'option4', 'correctindex', 'locode'];
              for (const field of required) {
                if (!rowData[field]) throw new Error(`Missing field: ${field}`);
              }

              // Validate LO
              const lo = los.find(l => l.code === rowData.locode && l.chapterId === selectedContext.chapterId);
              if (!lo) {
                throw new Error(`LO Code "${rowData.locode}" not found in selected chapter`);
              }

              const options: QuestionOption[] = [
                { id: generateId(), text: rowData.option1, isCorrect: rowData.correctindex === '1' },
                { id: generateId(), text: rowData.option2, isCorrect: rowData.correctindex === '2' },
                { id: generateId(), text: rowData.option3, isCorrect: rowData.correctindex === '3' },
                { id: generateId(), text: rowData.option4, isCorrect: rowData.correctindex === '4' },
              ];

              const correctOptionId = options.find(o => o.isCorrect)?.id || options[0].id;

              await createQuestion(
                rowData.text,
                options,
                correctOptionId,
                lo.id,
                selectedContext.chapterId,
                selectedContext.subjectId,
                selectedContext.gradeId,
                (rowData.difficulty?.toLowerCase() as DifficultyLevel) || DifficultyLevel.MEDIUM,
                rowData.explanation || '',
                currentUser?.id || '',
                []
              );

              uploadResults.success++;
            } catch (err: any) {
              uploadResults.failed++;
              uploadResults.errors.push({ row: i + 2, reason: err.message });
            }
          }

          setUploadResult(uploadResults);
          setIsProcessing(false);
        };

        processRows();
      },
      error: (error) => {
        alert(`Parsing error: ${error.message}`);
        setIsProcessing(false);
      }
    });
  };

  const downloadTemplate = () => {
    const content = "text,option1,option2,option3,option4,correctindex,difficulty,explanation,locode\nWhat is 2+2?,3,4,5,6,2,easy,Basic addition,LO-MTH-1.1";
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scorecraft_template.csv';
    a.click();
  };

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Questions</h1>
          <p className="text-gray-600">Upload multiple questions at once using a CSV file</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Step 1: Select Context</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Grade</label>
              <select 
                className="form-input"
                value={selectedContext.gradeId}
                onChange={e => setSelectedContext({ ...selectedContext, gradeId: e.target.value, subjectId: '', chapterId: '' })}
              >
                <option value="">Select Grade</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Subject</label>
              <select 
                className="form-input"
                value={selectedContext.subjectId}
                onChange={e => setSelectedContext({ ...selectedContext, subjectId: e.target.value, chapterId: '' })}
                disabled={!selectedContext.gradeId}
              >
                <option value="">Select Subject</option>
                {subjects.filter(s => s.gradeId === selectedContext.gradeId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Chapter</label>
              <select 
                className="form-input"
                value={selectedContext.chapterId}
                onChange={e => setSelectedContext({ ...selectedContext, chapterId: e.target.value })}
                disabled={!selectedContext.subjectId}
              >
                <option value="">Select Chapter</option>
                {chapters.filter(c => c.subjectId === selectedContext.subjectId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Step 2: Provide CSV Data</h2>
            <button onClick={downloadTemplate} className="text-primary-600 text-sm font-bold hover:underline">
              Download Template
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Paste your CSV data below. Make sure the headers match the template.
          </p>
          <textarea 
            className="form-input h-64 font-mono text-sm"
            placeholder="text,option1,option2,option3,option4,correctindex,difficulty,explanation,locode..."
            value={csvData}
            onChange={e => setCsvData(e.target.value)}
          />
          <div className="flex justify-end mt-6">
            <button 
              onClick={handleUpload} 
              disabled={isProcessing || !csvData}
              className={`btn-primary px-12 ${isProcessing ? 'opacity-50' : ''}`}
            >
              {isProcessing ? 'Processing...' : 'Upload Questions'}
            </button>
          </div>
        </div>

        {uploadResult && (
          <div className={`card ${uploadResult.failed > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <h2 className="text-xl font-bold mb-4">Upload Result</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <span className="block text-gray-500 text-sm">Total</span>
                <span className="text-2xl font-bold">{uploadResult.total}</span>
              </div>
              <div className="text-center text-green-600">
                <span className="block text-gray-500 text-sm">Success</span>
                <span className="text-2xl font-bold">{uploadResult.success}</span>
              </div>
              <div className="text-center text-red-600">
                <span className="block text-gray-500 text-sm">Failed</span>
                <span className="text-2xl font-bold">{uploadResult.failed}</span>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-bold text-sm text-red-800 mb-2">Errors:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {uploadResult.errors.map((err: any, idx: number) => (
                    <li key={idx}>Row {err.row}: {err.reason}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <button onClick={() => router.push('/teacher/questions')} className="btn-primary">
                View My Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
