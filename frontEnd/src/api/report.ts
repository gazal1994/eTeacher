import { apiFetch } from './client';
import { ReportRow } from '../types/models';

export async function getEnrolmentsSummary(): Promise<ReportRow[]> {
  return await apiFetch<ReportRow[]>('/api/reports/enrolments-summary');
}
