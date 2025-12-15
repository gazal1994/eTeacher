import React, { useState, useEffect } from 'react';
import { Course, Student, Enrolment } from '../../types/models';
import { Drawer } from '../Common/Drawer/Drawer';
import { Tabs, Tab } from '../Common/Tabs/Tabs';
import { EnrolledStudentsTab } from './EnrolledStudentsTab';
import { AddStudentsTab } from './AddStudentsTab';
import { ErrorBanner } from '../Common/ErrorBanner/ErrorBanner';
import * as enrolmentsApi from '../../api/enrolments';

type CourseDrawerProps = {
  course: Course | null;
  open: boolean;
  onClose: () => void;
  students: Student[];
  studentsLoading: boolean;
  onEnrolmentSuccess: () => void;
};

export const CourseDrawer: React.FC<CourseDrawerProps> = ({
  course,
  open,
  onClose,
  students,
  studentsLoading,
  onEnrolmentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [courseEnrolments, setCourseEnrolments] = useState<Enrolment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (course && open) {
      loadEnrolments();
    }
  }, [course, open]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadEnrolments = async () => {
    if (!course) return;

    setLoading(true);
    setError(null);
    try {
      const allEnrolments = await enrolmentsApi.getEnrolments();
      // Filter enrolments for this course
      const filtered = allEnrolments.filter((e) => e.courseId === course.id);
      setCourseEnrolments(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load enrolments');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (studentId: string) => {
    if (!course) return;

    setIsAssigning(true);
    setError(null);
    try {
      await enrolmentsApi.createEnrolment({
        studentId,
        courseId: course.id,
      });
      
      setSuccessMessage('Student assigned successfully!');
      
      // Reload enrolments
      await loadEnrolments();
      
      // Notify parent to refresh data
      onEnrolmentSuccess();
      
      // Stay on the current tab (add students)
    } catch (err: any) {
      if (err.message?.includes('409') || err.message?.toLowerCase().includes('already enrolled')) {
        setError('This student is already enrolled in this course.');
      } else {
        setError(err.message || 'Failed to assign student');
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignMultipleStudents = async (studentIds: string[]) => {
    if (!course || studentIds.length === 0) return;

    setIsAssigning(true);
    setError(null);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const studentId of studentIds) {
        try {
          await enrolmentsApi.createEnrolment({
            studentId,
            courseId: course.id,
          });
          successCount++;
        } catch (err: any) {
          failCount++;
        }
      }

      if (successCount > 0) {
        setSuccessMessage(`${successCount} student${successCount > 1 ? 's' : ''} assigned successfully!`);
      }
      if (failCount > 0) {
        setError(`${failCount} student${failCount > 1 ? 's' : ''} could not be assigned (may already be enrolled).`);
      }
      
      // Reload enrolments
      await loadEnrolments();
      
      // Notify parent to refresh data
      onEnrolmentSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to assign students');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!course) return null;

  const enrolledStudentIds = courseEnrolments.map((e) => e.studentId);

  const tabs: Tab[] = [
    {
      id: 'enrolled',
      label: `Enrolled Students (${courseEnrolments.length})`,
      content: <EnrolledStudentsTab enrolments={courseEnrolments} loading={loading} />,
    },
    {
      id: 'add',
      label: 'Add Students',
      content: (
        <AddStudentsTab
          students={students}
          enrolledStudentIds={enrolledStudentIds}
          loading={studentsLoading}
          onAssign={handleAssignStudent}
          onAssignMultiple={handleAssignMultipleStudents}
          isAssigning={isAssigning}
        />
      ),
    },
  ];

  return (
    <Drawer open={open} onClose={onClose} title={course.title}>
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <p className="text-sm text-slate-600">{course.description}</p>
      </div>

      {error && (
        <div className="px-6 pt-4">
          <ErrorBanner message={error} onClose={() => setError(null)} />
        </div>
      )}

      {successMessage && (
        <div className="px-6 pt-4">
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {successMessage}
          </div>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </Drawer>
  );
};
