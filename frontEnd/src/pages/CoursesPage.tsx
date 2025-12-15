import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Course, CourseFormData } from '../types/models';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCourses,
  addCourse,
  editCourse,
  removeCourse,
  clearError,
  clearSuccessMessage,
} from '../store/coursesSlice';
import { fetchStudents } from '../store/studentsSlice';
import { fetchEnrolments, createEnrolment, deleteEnrolment } from '../store/enrolmentsSlice';
import { CourseForm } from '../components/Courses/CourseForm/CourseForm';
import { StudentManagementDrawer } from '../components/Common/StudentManagementDrawer/StudentManagementDrawer';
import { CourseDetailsModal } from '../components/Courses/CourseDetailsModal/CourseDetailsModal';
import { Loading } from '../components/Common/Loading/Loading';
import { ErrorBanner } from '../components/Common/ErrorBanner/ErrorBanner';
import { Modal } from '../components/Common/Modal/Modal';
import { ConfirmModal } from '../components/Common/ConfirmModal/ConfirmModal';
import { getCourseDetails } from '../data/courseDetails';

export const CoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: courses, loading, error, successMessage } = useAppSelector(
    (state) => state.courses
  );
  const { items: students, loading: studentsLoading } = useAppSelector(
    (state) => state.students
  );
  const { items: enrolments } = useAppSelector(
    (state) => state.enrolments
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCourse, setDrawerCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'enrolled' | 'recent'>('name');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState<Course | null>(null);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchStudents());
    dispatch(fetchEnrolments());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Helper functions for course statistics
  const getCourseStats = (courseId: string) => {
    const courseEnrolments = enrolments.filter(e => e.courseId === courseId);
    const enrolledCount = courseEnrolments.length;
    
    // Last enrolment date
    const lastEnrolment = courseEnrolments.length > 0
      ? courseEnrolments.sort((a, b) => 
          new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
        )[0]
      : null;
    
    // Weekly trend (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCount = courseEnrolments.filter(e => 
      new Date(e.enrolledAt) >= weekAgo
    ).length;
    
    // Recent students (last 3)
    const recentStudentIds = courseEnrolments
      .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
      .slice(0, 3)
      .map(e => e.studentId);
    const recentStudents = students.filter(s => recentStudentIds.includes(s.id));
    
    // Health badge
    let badge: 'popular' | 'idle' | 'new' = 'idle';
    if (enrolledCount >= 5) badge = 'popular';
    else if (enrolledCount > 0) badge = 'new';
    
    return {
      enrolledCount,
      lastEnrolment,
      weeklyCount,
      recentStudents,
      badge
    };
  };

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'enrolled') {
      filtered = filtered.sort((a, b) => {
        const aCount = enrolments.filter(e => e.courseId === a.id).length;
        const bCount = enrolments.filter(e => e.courseId === b.id).length;
        return bCount - aCount;
      });
    } else if (sortBy === 'recent') {
      filtered = filtered.sort((a, b) => {
        const aEnrolments = enrolments.filter(e => e.courseId === a.id);
        const bEnrolments = enrolments.filter(e => e.courseId === b.id);
        const aLast = aEnrolments.length > 0 
          ? Math.max(...aEnrolments.map(e => new Date(e.enrolledAt).getTime()))
          : 0;
        const bLast = bEnrolments.length > 0
          ? Math.max(...bEnrolments.map(e => new Date(e.enrolledAt).getTime()))
          : 0;
        return bLast - aLast;
      });
    }
    
    return filtered;
  }, [courses, searchTerm, sortBy, enrolments]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleAdd = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    setDetailsModalOpen(false);
  };

  const handleManage = (course: Course) => {
    setDrawerCourse(course);
    setDrawerOpen(true);
    setDetailsModalOpen(false);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerCourse(null);
    handleEnrolmentSuccess();
  };

  const handleEnrolmentSuccess = () => {
    // Optionally refresh courses or other data
    dispatch(fetchCourses());
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
    setDetailsModalOpen(false);
  };

  const handleCardClick = (course: Course) => {
    setDetailsCourse(course);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setDetailsCourse(null);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(removeCourse(courseToDelete.id)).unwrap();
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      // Error is handled in Redux slice
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  const handleSubmit = async (data: CourseFormData) => {
    try {
      if (selectedCourse) {
        await dispatch(editCourse({ id: selectedCourse.id, data })).unwrap();
      } else {
        await dispatch(addCourse(data)).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error is already handled in the slice
      throw err;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-tour="courses-section">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('courses.title')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('courses.subtitle')}</p>
          </div>
          <button 
            data-tour="action-buttons"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
            onClick={handleAdd}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('courses.addCourse')}
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && <ErrorBanner message={error} onClose={() => dispatch(clearError())} />}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Search and Sort Controls */}
      {courses.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'enrolled' | 'recent')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
            >
              <option value="name">Sort: A–Z</option>
              <option value="enrolled">Sort: Most Enrolled</option>
              <option value="recent">Sort: Recently Active</option>
            </select>
          </div>
        </div>
      )}

      {/* Course Cards */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-slate-700 font-semibold text-lg mb-1">
            {t('courses.noCourses')}
          </p>
          <p className="text-sm text-slate-500 mb-6">
            {t('courses.startByAdding')}
          </p>
          {!searchTerm && (
            <button 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
              onClick={handleAdd}
            >
              + {t('courses.addCourse')}
            </button>
          )}
        </div>
      ) : (
        <div data-tour="courses-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndSortedCourses.map((course) => {
            const stats = getCourseStats(course.id);
            
            return (
              <div 
                key={course.id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col cursor-pointer"
                onClick={() => handleCardClick(course)}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-slate-200">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800 flex-1">{course.title}</h3>
                    {/* Health Badge */}
                    {stats.badge === 'popular' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex-shrink-0">
                        Popular
                      </span>
                    )}
                    {stats.badge === 'new' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                        Active
                      </span>
                    )}
                    {stats.badge === 'idle' && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full flex-shrink-0">
                        Idle
                      </span>
                    )}
                  </div>
                  {course.description && (
                    <p className="text-sm text-slate-500 leading-relaxed">{course.description}</p>
                  )}
                </div>

                {/* Card Body - Metadata */}
                <div className="px-6 py-4 space-y-3">
                  {/* Stats Row */}
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">{stats.enrolledCount}</span>
                      <span className="text-slate-500">{t('courses.students', { count: stats.enrolledCount })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-slate-500">
                        {stats.lastEnrolment 
                          ? `Last: ${formatDate(stats.lastEnrolment.enrolledAt)}`
                          : t('courses.noEnrolments')
                        }
                      </span>
                    </div>
                  </div>

                  {/* Weekly Trend */}
                  {stats.weeklyCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md font-medium">
                        +{stats.weeklyCount} this week
                      </span>
                    </div>
                  )}

                  {/* Recent Students Preview */}
                  {stats.recentStudents.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-2">Recent students:</p>
                      <div className="flex items-center gap-2 flex-wrap">
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
                              className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-md text-xs"
                              title={student.fullName}
                            >
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                                {initials}
                              </div>
                              <span className="text-slate-700 max-w-[100px] truncate">{student.fullName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCourse ? 'Edit Course' : 'Create Course'}
      >
        <CourseForm
          course={selectedCourse}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Delete course"
        message={`Are you sure you want to delete "${courseToDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <StudentManagementDrawer
        course={drawerCourse}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        students={students}
        enrolments={enrolments}
        studentsLoading={studentsLoading}
        onAddEnrolment={async (studentId) => {
          if (!drawerCourse) return;
          await dispatch(createEnrolment({ studentId, courseId: drawerCourse.id })).unwrap();
        }}
        onDeleteEnrolment={async (studentId) => {
          if (!drawerCourse) return;
          await dispatch(deleteEnrolment({ studentId, courseId: drawerCourse.id })).unwrap();
        }}
      />

      {detailsCourse && (
        <CourseDetailsModal
          isOpen={detailsModalOpen}
          onClose={handleCloseDetailsModal}
          course={detailsCourse}
          details={getCourseDetails(detailsCourse.id)}
          stats={getCourseStats(detailsCourse.id)}
          onManage={() => handleManage(detailsCourse)}
          onEdit={() => handleEdit(detailsCourse)}
          onDelete={() => handleDelete(detailsCourse)}
        />
      )}
    </div>
  );
};
