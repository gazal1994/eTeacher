import React from 'react';
import { Course, Enrolment, Student } from '../../types/models';

type CourseEnrolmentCardProps = {
  course: Course;
  enrolments: Enrolment[];
  students: Student[];
  onManage: (course: Course) => void;
  isLoading?: boolean;
};

export const CourseEnrolmentCard: React.FC<CourseEnrolmentCardProps> = ({
  course,
  enrolments,
  students,
  onManage,
}) => {
  // Get enrolled students for this course
  const enrolledStudents = enrolments
    .map(e => students.find(s => s.id === e.studentId))
    .filter((s): s is Student => s !== undefined)
    .sort((a, b) => {
      const enrolmentA = enrolments.find(e => e.studentId === a.id);
      const enrolmentB = enrolments.find(e => e.studentId === b.id);
      if (!enrolmentA || !enrolmentB) return 0;
      return new Date(enrolmentB.enrolledAt).getTime() - new Date(enrolmentA.enrolledAt).getTime();
    });

  const displayLimit = 3;
  const hasMore = enrolledStudents.length > displayLimit;
  const displayedStudents = enrolledStudents.slice(0, displayLimit);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onManage(course);
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer select-none"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick(e as any);
        }
      }}
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
            {course.description && (
              <p className="text-sm text-slate-600 mt-1">{course.description}</p>
            )}
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-medium whitespace-nowrap ml-4">
            {enrolments.length} {enrolments.length === 1 ? 'student' : 'students'}
          </span>
        </div>
      </div>

      {/* Card Body - Student List Preview */}
      <div className="p-4">
        {enrolledStudents.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            <p className="text-sm">No students enrolled yet</p>
            <p className="text-xs mt-1 text-slate-400">Click to add students</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedStudents.map((student) => {
              const enrolment = enrolments.find(e => e.studentId === student.id);
              return (
                <div key={student.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-700">
                      {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{student.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{student.email}</p>
                  </div>
                  {enrolment && (
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(enrolment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
            
            {hasMore && (
              <div className="flex items-center justify-center py-2 text-sm text-slate-500">
                <span>+ {enrolledStudents.length - displayLimit} more</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
            
            {!hasMore && enrolledStudents.length > 0 && (
              <div className="flex items-center justify-center py-1 text-xs text-slate-400">
                Click to manage enrolments
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
