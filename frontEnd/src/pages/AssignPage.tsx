import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AssignPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-16 w-16 text-blue-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          Student Assignment Has Moved!
        </h1>
        <p className="text-slate-600 mb-6">
          You can now assign students to courses directly from the <strong>Courses</strong> page.
          Click the <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-sm font-medium">Manage</span> button
          next to any course to view enrolled students and assign new ones.
        </p>
        <button
          onClick={() => navigate('/courses')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Go to Courses Page
        </button>
      </div>

      <div className="mt-8 bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">How to Assign Students:</h2>
        <ol className="space-y-3 text-slate-600">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
              1
            </span>
            <span>Navigate to the <strong>Courses</strong> page</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
              2
            </span>
            <span>Click the <strong>Manage</strong> button on any course</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
              3
            </span>
            <span>Switch to the <strong>Add Students</strong> tab</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
              4
            </span>
            <span>Search for students and click <strong>Assign</strong></span>
          </li>
        </ol>
      </div>
    </div>
  );
};
