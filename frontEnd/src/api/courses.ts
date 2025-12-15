import { apiFetch } from './client';
import { Course, CourseFormData } from '../types/models';

export async function getCourses(): Promise<Course[]> {
  return await apiFetch<Course[]>('/api/courses');
}

export async function getCourse(id: string): Promise<Course> {
  return await apiFetch<Course>(`/api/courses/${id}`);
}

export async function createCourse(data: CourseFormData): Promise<Course> {
  return await apiFetch<Course>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCourse(
  id: string,
  data: CourseFormData
): Promise<Course> {
  return await apiFetch<Course>(`/api/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(id: string): Promise<void> {
  await apiFetch<void>(`/api/courses/${id}`, {
    method: 'DELETE',
  });
}
