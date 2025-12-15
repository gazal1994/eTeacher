import React, { useState, useMemo } from 'react';
import { Student } from '../../types/models';

type AddStudentsTabProps = {
  students: Student[];
  enrolledStudentIds: string[];
  loading: boolean;
  onAssign: (studentId: string) => Promise<void>;
  onAssignMultiple: (studentIds: string[]) => Promise<void>;
  isAssigning: boolean;
};

export const AddStudentsTab: React.FC<AddStudentsTabProps> = ({
  students,
  enrolledStudentIds,
  loading,
  onAssign,
  onAssignMultiple,
  isAssigning,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Filter out already enrolled students
  const availableStudents = useMemo(() => {
    return students.filter((student) => !enrolledStudentIds.includes(student.id));
  }, [students, enrolledStudentIds]);

  // Filter by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return availableStudents;

    const term = searchTerm.toLowerCase();
    return availableStudents.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
    );
  }, [availableStudents, searchTerm]);

  const handleAssign = async (studentId: string) => {
    setAssigningStudentId(studentId);
    try {
      await onAssign(studentId);
    } finally {
      setAssigningStudentId(null);
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleToggleAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const handleAssignSelected = async () => {
    if (selectedStudentIds.length === 0) return;
    try {
      await onAssignMultiple(selectedStudentIds);
      setSelectedStudentIds([]);
    } catch (err) {
      // Error handled by parent
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No students available</h3>
        <p className="mt-1 text-sm text-slate-500">
          There are no students in the system to enrol.
        </p>
      </div>
    );
  }

  if (availableStudents.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">All students enrolled</h3>
        <p className="mt-1 text-sm text-slate-500">
          All students in the system are already enrolled in this course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Count and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">{filteredStudents.length}</span> student
          {filteredStudents.length !== 1 ? 's' : ''} available
        </div>
        {selectedStudentIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {selectedStudentIds.length} selected
            </span>
            <button
              onClick={handleAssignSelected}
              disabled={isAssigning}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAssigning ? 'Assigning...' : `Assign ${selectedStudentIds.length} Student${selectedStudentIds.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>

      {/* Select All */}
      {filteredStudents.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
            onChange={handleToggleAll}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-slate-700 cursor-pointer">
            Select All
          </label>
        </div>
      )}

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No students match your search.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`flex items-center gap-3 p-4 bg-white rounded-lg border transition-all ${
                selectedStudentIds.includes(student.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedStudentIds.includes(student.id)}
                onChange={() => handleToggleStudent(student.id)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">{student.fullName}</div>
                <div className="text-sm text-slate-500">{student.email}</div>
              </div>
              <button
                onClick={() => handleAssign(student.id)}
                disabled={isAssigning || assigningStudentId === student.id}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assigningStudentId === student.id ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
