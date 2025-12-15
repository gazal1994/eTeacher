import React from 'react';
import { Enrolment } from '../../types/models';

type EnrolledStudentsTabProps = {
  enrolments: Enrolment[];
  loading: boolean;
};

export const EnrolledStudentsTab: React.FC<EnrolledStudentsTabProps> = ({
  enrolments,
  loading,
}) => {
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

  if (enrolments.length === 0) {
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
        <h3 className="mt-2 text-sm font-medium text-slate-900">No students enrolled yet</h3>
        <p className="mt-1 text-sm text-slate-500">
          Switch to "Add Students" tab to enrol students in this course.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600 mb-4">
        <span className="font-medium text-slate-900">{enrolments.length}</span> student
        {enrolments.length !== 1 ? 's' : ''} enrolled
      </div>

      {enrolments.map((enrolment, index) => (
        <div
          key={`${enrolment.studentId}-${index}`}
          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
        >
          <div className="flex-1">
            <div className="font-medium text-slate-900">
              {enrolment.studentName || enrolment.studentId}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Enrolled on {formatDate(enrolment.enrolledAt)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Enrolled
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
