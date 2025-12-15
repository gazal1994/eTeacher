import { apiFetch } from './client';
import { Student } from '../types/models';

// Get students from backend API
export async function getStudents(): Promise<Student[]> {
  return await apiFetch<Student[]>('/api/students');
}
