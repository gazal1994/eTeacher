import React, { useState, useEffect } from 'react';
import { Modal } from '../Common/Modal/Modal';
import { Course, Student, Enrolment } from '../../types/models';

type EnrolmentFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentId: string, courseId: string) => void;
  courses: Course[];
  students: Student[];
  enrolment?: Enrolment | null;
  isLoading?: boolean;
};

export const EnrolmentFormModal: React.FC<EnrolmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courses,
  students,
  enrolment = null,
  isLoading = false,
}) => {
  const [studentId, setStudentId] = useState<string | ''>('');
  const [courseId, setCourseId] = useState<string | ''>('');
  const [error, setError] = useState<string>('');

  const isEditMode = !!enrolment;

  useEffect(() => {
    if (isOpen && enrolment) {
      setStudentId(enrolment.studentId);
      setCourseId(enrolment.courseId);
      setError('');
    } else if (isOpen && !enrolment) {
      setStudentId('');
      setCourseId('');
      setError('');
    }
  }, [isOpen, enrolment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentId || !courseId) {
      setError('Please select both a student and a course.');
      return;
    }

    onSubmit(studentId as string, courseId as string);
  };

  const handleClose = () => {
    setStudentId('');
    setCourseId('');
    setError('');
    onClose();
  };

  // Sort students and courses alphabetically
  const sortedStudents = [...students].sort((a, b) => a.fullName.localeCompare(b.fullName));
  const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Enrolment' : 'Add Enrolment'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Student Dropdown */}
        <div>
          <label htmlFor="student" className="block text-sm font-medium text-slate-700 mb-1">
            Student <span className="text-red-500">*</span>
          </label>
          <select
            id="student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          >
            <option value="">-- Select Student --</option>
            {sortedStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName} ({student.email})
              </option>
            ))}
          </select>
        </div>

        {/* Course Dropdown */}
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-slate-700 mb-1">
            Course <span className="text-red-500">*</span>
          </label>
          <select
            id="course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          >
            <option value="">-- Select Course --</option>
            {sortedCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
