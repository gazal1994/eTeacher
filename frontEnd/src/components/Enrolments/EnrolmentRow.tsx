import React from 'react';
import { Enrolment, Student } from '../../types/models';

type EnrolmentRowProps = {
  enrolment: Enrolment;
  student: Student | undefined;
  onEdit: (enrolment: Enrolment) => void;
  onDelete: (enrolment: Enrolment) => void;
  isLoading?: boolean;
};

export const EnrolmentRow: React.FC<EnrolmentRowProps> = ({
  enrolment,
  student,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!student) {
    return null;
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{student.fullName}</p>
        <p className="text-xs text-slate-500">{student.email}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 min-w-[100px] text-right">
          {formatDate(enrolment.enrolledAt)}
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => onEdit(enrolment)}
            disabled={isLoading}
          >
            Edit
          </button>
          <button
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => onDelete(enrolment)}
            disabled={isLoading}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
