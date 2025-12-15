import { apiFetch } from './client';
import { Enrolment, EnrolmentFormData } from '../types/models';

export async function getEnrolments(): Promise<Enrolment[]> {
  return await apiFetch<Enrolment[]>('/api/enrolments');
}

export async function createEnrolment(
  data: EnrolmentFormData
): Promise<Enrolment> {
  return await apiFetch<Enrolment>('/api/enrolments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteEnrolment(
  studentId: string,
  courseId: string
): Promise<void> {
  return await apiFetch<void>(
    `/api/enrolments?studentId=${studentId}&courseId=${courseId}`,
    {
      method: 'DELETE',
    }
  );
}
