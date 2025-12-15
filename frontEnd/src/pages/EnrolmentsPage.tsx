import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEnrolments, deleteEnrolment, createEnrolment, clearError } from '../store/enrolmentsSlice';
import { fetchCourses } from '../store/coursesSlice';
import { fetchStudents } from '../store/studentsSlice';
import { Loading } from '../components/Common/Loading/Loading';
import { ErrorBanner } from '../components/Common/ErrorBanner/ErrorBanner';
import { CourseEnrolmentCard } from '../components/Enrolments/CourseEnrolmentCard';
import { StudentManagementDrawer } from '../components/Common/StudentManagementDrawer/StudentManagementDrawer';
import { Course, Enrolment } from '../types/models';

type GroupedEnrolments = {
  courseId: number;
  enrolments: Enrolment[];
};

export const EnrolmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const { items: enrolments, loading: enrolmentsLoading, error: enrolmentsError } = useAppSelector(
    (state) => state.enrolments
  );
  const { items: courses, loading: coursesLoading } = useAppSelector((state) => state.courses);
  const { items: students, loading: studentsLoading } = useAppSelector((state) => state.students);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    dispatch(fetchEnrolments());
    dispatch(fetchCourses());
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    if (enrolmentsError) {
      setErrorMessage(enrolmentsError);
    }
  }, [enrolmentsError]);

  // Group enrolments by course and include courses with no enrolments
  const groupedEnrolments: GroupedEnrolments[] = React.useMemo(() => {
    return courses.map(course => ({
      courseId: course.id,
      enrolments: enrolments.filter(e => e.courseId === course.id)
    })).sort((a, b) => {
      const courseA = courses.find((c) => c.id === a.courseId);
      const courseB = courses.find((c) => c.id === b.courseId);
      return (courseA?.title || '').localeCompare(courseB?.title || '');
    });
  }, [enrolments, courses]);

  const handleManageCourse = (course: Course) => {
    setSelectedCourse(course);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedCourse(null);
  };

  const handleAddEnrolment = async (studentId: number) => {
    if (!selectedCourse) return;
    
    await dispatch(createEnrolment({ 
      studentId, 
      courseId: selectedCourse.id 
    })).unwrap();
  };

  const handleDeleteEnrolment = async (studentId: number) => {
    if (!selectedCourse) return;
    
    await dispatch(deleteEnrolment({
      studentId,
      courseId: selectedCourse.id,
    })).unwrap();
  };

  const loading = enrolmentsLoading || coursesLoading || studentsLoading;

  if (loading) {
    return <Loading />;
  }

  return (
    <div data-tour="enrolments-section" className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">{t('enrolments.title')}</h1>
        <p className="text-sm text-slate-600 mt-2">{t('enrolments.subtitle')}</p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <ErrorBanner
          message={errorMessage}
          onClose={() => {
            setErrorMessage('');
            dispatch(clearError());
          }}
        />
      )}

      {/* Course Cards */}
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-slate-600 font-medium mb-2">No courses yet</p>
          <p className="text-sm text-slate-500">
            Create a course first to start managing enrolments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedEnrolments.map((group) => {
            const course = courses.find((c) => c.id === group.courseId);
            if (!course) return null;

            return (
              <CourseEnrolmentCard
                key={course.id}
                course={course}
                enrolments={group.enrolments}
                students={students}
                onManage={handleManageCourse}
              />
            );
          })}
        </div>
      )}

      {/* Student Management Drawer */}
      <StudentManagementDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        course={selectedCourse}
        students={students}
        enrolments={enrolments}
        studentsLoading={studentsLoading}
        onAddEnrolment={handleAddEnrolment}
        onDeleteEnrolment={handleDeleteEnrolment}
      />
    </div>
  );
};
