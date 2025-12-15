import React, { useState, useEffect, useMemo } from 'react';
import { Drawer } from '../Common/Drawer/Drawer';
import { Tabs } from '../Common/Tabs/Tabs';
import { Course, Student, Enrolment } from '../../types/models';
import { ErrorBanner } from '../Common/ErrorBanner/ErrorBanner';

type EnrolmentDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  students: Student[];
  enrolments: Enrolment[];
  onAddEnrolment: (studentId: string) => Promise<void>;
  onDeleteEnrolment: (studentId: string) => Promise<void>;
  studentsLoading: boolean;
};

export const EnrolmentDrawer: React.FC<EnrolmentDrawerProps> = ({
  isOpen,
  onClose,
  course,
  students,
  enrolments,
  onAddEnrolment,
  onDeleteEnrolment,
  studentsLoading,
}) => {
  const [activeTab, setActiveTab] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Get enrolled students for this course - memoized to prevent recalculation
  // IMPORTANT: useMemo must be called before any conditional returns
  const enrolledStudentIds = useMemo(() => {
    if (!course) return [];
    return enrolments
      .filter(e => e.courseId === course.id)
      .map(e => e.studentId);
  }, [enrolments, course]);

  const enrolledStudents = useMemo(() => 
    students.filter(s => enrolledStudentIds.includes(s.id)),
    [students, enrolledStudentIds]
  );

  // Sort by enrolled date (latest first)
  const sortedEnrolledStudents = useMemo(() => {
    if (!course) return [];
    return enrolledStudents.sort((a, b) => {
      const enrolmentA = enrolments.find(e => e.studentId === a.id && e.courseId === course.id);
      const enrolmentB = enrolments.find(e => e.studentId === b.id && e.courseId === course.id);
      if (!enrolmentA || !enrolmentB) return 0;
      return new Date(enrolmentB.enrolledAt).getTime() - new Date(enrolmentA.enrolledAt).getTime();
    });
  }, [enrolledStudents, enrolments, course]);

  // Available students to add - memoized with search filter
  const availableStudents = useMemo(() => 
    students
      .filter(s => !enrolledStudentIds.includes(s.id))
      .filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   s.email.toLowerCase().includes(searchTerm.toLowerCase())),
    [students, enrolledStudentIds, searchTerm]
  );

  useEffect(() => {
    // Only reset when drawer transitions from closed to open
    if (isOpen && !prevIsOpen) {
      setActiveTab('add');
      setSearchTerm('');
      setError('');
      setSuccessMessage('');
      setSelectedStudentIds([]);
    }
    setPrevIsOpen(isOpen);
  }, [isOpen, prevIsOpen]);

  if (!course) return null;

  const handleAddStudent = async (studentId: string) => {
    setLoadingStudentId(studentId);
    setError('');
    setSuccessMessage('');

    try {
      await onAddEnrolment(studentId);
      setSuccessMessage('Student enrolled successfully!');
      // Stay on Add Students tab to allow multiple assignments
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      if (err?.message?.includes('409') || err?.message?.toLowerCase().includes('already enrolled')) {
        setError('Student is already enrolled in this course.');
      } else {
        setError(err?.message || 'Failed to enroll student.');
      }
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    setLoadingStudentId(studentId);
    setError('');
    setSuccessMessage('');

    try {
      await onDeleteEnrolment(studentId);
      setSuccessMessage('Student removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to remove student.');
    } finally {
      setLoadingStudentId(null);
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
    if (selectedStudentIds.length === availableStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(availableStudents.map(s => s.id));
    }
  };

  const handleAssignMultipleStudents = async () => {
    if (!course || selectedStudentIds.length === 0) return;

    setIsAssigning(true);
    setError('');
    setSuccessMessage('');

    let successCount = 0;
    let failCount = 0;

    for (const studentId of selectedStudentIds) {
      try {
        await onAddEnrolment(studentId);
        successCount++;
      } catch (err: any) {
        failCount++;
      }
    }

    if (successCount > 0) {
      setSuccessMessage(`${successCount} student(s) assigned successfully!`);
    }
    if (failCount > 0) {
      setError(`${failCount} student(s) could not be assigned (may already be enrolled).`);
    }

    setSelectedStudentIds([]);
    setIsAssigning(false);
    setTimeout(() => {
      setSuccessMessage('');
      setError('');
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const tabs = [
    {
      id: 'enrolled',
      label: `Enrolled Students (${enrolledStudents.length})`,
      content: (
        <div>
          {studentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-lg"></div>
              ))}
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-sm font-medium">No students enrolled yet</p>
              <p className="text-xs mt-1">Add students from the "Add Students" tab</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">{enrolledStudents.length} student{enrolledStudents.length !== 1 ? 's' : ''} enrolled</p>
              {sortedEnrolledStudents.map((student) => {
                const enrolment = enrolments.find(e => e.studentId === student.id && e.courseId === course.id);
                return (
                  <div key={student.id} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{student.fullName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
                      {enrolment && (
                        <p className="text-xs text-slate-400 mt-1">Enrolled on {formatDate(enrolment.enrolledAt)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Enrolled
                      </span>
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        disabled={loadingStudentId === student.id}
                        className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingStudentId === student.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'add',
      label: 'Add Students',
      content: (
        <div>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Available Students */}
          {studentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-lg"></div>
              ))}
            </div>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">All students are enrolled!</p>
              <p className="text-xs mt-1">There are no more students to add to this course.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All Checkbox */}
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.length === availableStudents.length}
                    onChange={handleToggleAll}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Select All</span>
                </label>
                <p className="text-xs text-slate-500">{availableStudents.length} student{availableStudents.length !== 1 ? 's' : ''} available</p>
              </div>

              {/* Bulk Actions Bar */}
              {selectedStudentIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleAssignMultipleStudents}
                    disabled={isAssigning}
                    className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAssigning ? 'Assigning...' : 'Assign Selected'}
                  </button>
                </div>
              )}

              {/* Student List */}
              {availableStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <div 
                    key={student.id} 
                    className={`bg-white border rounded-lg p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleStudent(student.id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{student.fullName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
                    </div>
                    <button
                      onClick={() => handleAddStudent(student.id)}
                      disabled={loadingStudentId === student.id || isAssigning}
                      className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loadingStudentId === student.id ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Drawer open={isOpen} onClose={onClose} title={course.title}>
      <div className="h-full flex flex-col">
        {/* Description */}
        {course.description && (
          <div className="px-6 pt-4 pb-2 border-b">
            <p className="text-sm text-slate-600">{course.description}</p>
          </div>
        )}

        {/* Messages */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4">
            <ErrorBanner message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>
    </Drawer>
  );
};
