export type Course = {
  id: string;
  title: string;
  description: string;
};

export type Student = {
  id: string;
  fullName: string;
  email: string;
};

export type Enrolment = {
  studentId: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  enrolledAt: string; // ISO date
};

export type ReportRow = {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
};

export type CourseFormData = {
  title: string;
  description: string;
};

export type EnrolmentFormData = {
  studentId: string;
  courseId: string;
};
