import React, { useEffect } from 'react';
import { Course } from '../../../types/models';
import { CourseDetails } from '../../../data/courseDetails';

type CourseDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  details: CourseDetails;
  stats: {
    enrolledCount: number;
    lastEnrolment: { enrolledAt: string } | null;
    weeklyCount: number;
    recentStudents: Array<{ id: number; fullName: string }>;
    badge: 'popular' | 'idle' | 'new';
  };
  onManage: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  isOpen,
  onClose,
  course,
  details,
  stats,
  onManage,
  onEdit,
  onDelete,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalLectures = details.syllabus.reduce((sum, section) => sum + section.lectures, 0);
  const totalMinutes = details.syllabus.reduce((sum, section) => sum + section.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getInstructorInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBadgeStyles = () => {
    switch (stats.badge) {
      case 'popular':
        return 'bg-emerald-100 text-emerald-700';
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'idle':
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getBadgeText = () => {
    switch (stats.badge) {
      case 'popular':
        return 'Popular';
      case 'new':
        return 'Active';
      case 'idle':
        return 'Idle';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{course.title}</h2>
              {course.description && (
                <p className="text-slate-600">{course.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 ${getBadgeStyles()} text-sm font-semibold rounded-full`}>
                {getBadgeText()}
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Instructor */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Instructor</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                {getInstructorInitials(details.instructor.name)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{details.instructor.name}</h3>
                <p className="text-sm text-slate-600">{details.instructor.title}</p>
                <p className="text-sm text-slate-500 mt-1">{details.instructor.bio}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Course Info</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Students</p>
                <p className="text-lg font-semibold text-slate-900">{stats.enrolledCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Duration</p>
                <p className="text-lg font-semibold text-slate-900">{details.durationHours}h</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Level</p>
                <p className="text-lg font-semibold text-slate-900">{details.level}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Language</p>
                <p className="text-lg font-semibold text-slate-900">{details.language}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Last Updated</p>
                <p className="text-sm font-semibold text-slate-900">{formatDate(details.lastUpdated)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Last Enrolment</p>
                <p className="text-sm font-semibold text-slate-900">
                  {stats.lastEnrolment ? formatDate(stats.lastEnrolment.enrolledAt) : 'None'}
                </p>
              </div>
            </div>
            {stats.weeklyCount > 0 && (
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                  +{stats.weeklyCount} new students this week
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 my-6" />

          {/* What You'll Learn */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">What You'll Learn</p>
            <ul className="space-y-2">
              {details.whatYouWillLearn.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Requirements</p>
            <ul className="space-y-2">
              {details.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Syllabus */}
          {details.syllabus.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Course Curriculum</p>
              <div className="bg-slate-50 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    <span className="font-semibold">{details.syllabus.length}</span> sections • 
                    <span className="font-semibold"> {totalLectures}</span> lectures
                  </span>
                  <span className="text-slate-700 font-medium">
                    {totalHours}h {remainingMinutes}m total
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {details.syllabus.map((section, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{section.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {section.lectures} lectures • {Math.floor(section.durationMinutes / 60)}h {section.durationMinutes % 60}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.syllabus.length === 0 && (
            <div className="mb-6 p-6 bg-slate-50 rounded-xl text-center">
              <p className="text-slate-600">Syllabus coming soon</p>
            </div>
          )}

          {/* Recent Students */}
          {stats.recentStudents.length > 0 && (
            <>
              <div className="border-t border-slate-200 my-6" />
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Recently Enrolled</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {stats.recentStudents.map((student) => {
                    const initials = student.fullName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={student.id}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                          {initials}
                        </div>
                        <span className="text-sm text-slate-700 font-medium">{student.fullName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-slate-200 my-6" />

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-5 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Course
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="px-5 py-2.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Course
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManage();
              }}
              data-tour="manage-button"
              className="px-5 py-2.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Manage Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
