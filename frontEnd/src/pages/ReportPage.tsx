import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchReport, clearError } from '../store/reportSlice';
import { fetchCourses } from '../store/coursesSlice';
import { fetchEnrolments } from '../store/enrolmentsSlice';
import { fetchStudents } from '../store/studentsSlice';
import { Loading } from '../components/Common/Loading/Loading';
import { ErrorBanner } from '../components/Common/ErrorBanner/ErrorBanner';
import { AnalyticsModal } from '../components/Common/AnalyticsModal';
import { ReportRow } from '../types/models';
import './ReportPage.css';

type SortOption = 'most' | 'least' | 'az' | 'recent';
type StatusFilter = 'all' | 'active' | 'idle';

interface EnhancedReportRow extends ReportRow {
  lastEnrolment: string | null;
  percentage: number;
  status: 'active' | 'idle';
  enrolments: any[];
}

export const ReportPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: report, loading, error } = useAppSelector((state) => state.report);
  const { items: enrolments } = useAppSelector((state) => state.enrolments);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('most');
  const [sortColumn, setSortColumn] = useState<'title' | 'students' | 'percentage' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<EnhancedReportRow | null>(null);
  const [exportPreview, setExportPreview] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchReport());
    dispatch(fetchCourses());
    dispatch(fetchEnrolments());
    dispatch(fetchStudents());
  }, [dispatch]);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCourse(null);
    setExportPreview(null);
  };

  const openKpiModal = (kpiType: string) => {
    setActiveModal(kpiType);
  };

  const openCourseModal = (course: EnhancedReportRow) => {
    setSelectedCourse(course);
    setActiveModal('course-details');
  };

  const openExportPreview = (type: 'csv' | 'json') => {
    const data = type === 'json' ? {
      generated: new Date().toISOString(),
      summary: kpis,
      courses: filteredAndSortedReport
    } : null;
    setExportPreview({ type, data });
    setActiveModal('export-preview');
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalCourses = report.length;
    const totalEnrolments = report.reduce((sum, row) => sum + row.totalStudents, 0);
    const activeCourses = report.filter(row => row.totalStudents > 0).length;
    const idleCourses = report.filter(row => row.totalStudents === 0).length;
    const avgStudents = totalCourses > 0 ? (totalEnrolments / totalCourses).toFixed(1) : '0';

    // Time-based insights
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newThisWeek = enrolments.filter(e => new Date(e.enrolledAt) >= weekAgo).length;
    const newThisMonth = enrolments.filter(e => new Date(e.enrolledAt) >= monthAgo).length;

    // Most active course (last 7 days)
    const recentEnrolments = enrolments.filter(e => new Date(e.enrolledAt) >= weekAgo);
    const courseCounts: Record<string, number> = {};
    recentEnrolments.forEach(e => {
      courseCounts[e.courseId] = (courseCounts[e.courseId] || 0) + 1;
    });
    const mostActiveCourseId = Object.keys(courseCounts).reduce((a, b) => 
      courseCounts[a] > courseCounts[b] ? a : b, Object.keys(courseCounts)[0] || ''
    );
    const mostActiveCourse = mostActiveCourseId ? report.find(r => r.courseId === mostActiveCourseId) : null;

    return {
      totalCourses,
      totalEnrolments,
      activeCourses,
      idleCourses,
      avgStudents,
      newThisWeek,
      newThisMonth,
      mostActiveCourse: mostActiveCourse?.courseTitle || 'N/A'
    };
  }, [report, enrolments]);

  // Enhanced report data with additional analytics
  const enhancedReport = useMemo(() => {
    return report.map(row => {
      const courseEnrolments = enrolments.filter(e => e.courseId === row.courseId);
      const lastEnrolment = courseEnrolments.length > 0
        ? courseEnrolments.sort((a, b) => 
            new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
          )[0]
        : null;
      
      const percentage = kpis.totalEnrolments > 0
        ? ((row.totalStudents / kpis.totalEnrolments) * 100).toFixed(1)
        : '0';

      return {
        ...row,
        lastEnrolment: lastEnrolment?.enrolledAt || null,
        percentage: parseFloat(percentage),
        status: (row.totalStudents > 0 ? 'active' : 'idle') as 'active' | 'idle',
        enrolments: courseEnrolments
      };
    });
  }, [report, enrolments, kpis.totalEnrolments]);

  // Filtered and sorted data
  const filteredAndSortedReport = useMemo(() => {
    let filtered = enhancedReport;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(row => row.status === statusFilter);
    }

    // Sorting
    let sorted = [...filtered];
    if (sortColumn) {
      sorted.sort((a, b) => {
        let aVal: any, bVal: any;
        if (sortColumn === 'title') {
          aVal = a.courseTitle.toLowerCase();
          bVal = b.courseTitle.toLowerCase();
        } else if (sortColumn === 'students') {
          aVal = a.totalStudents;
          bVal = b.totalStudents;
        } else if (sortColumn === 'percentage') {
          aVal = a.percentage;
          bVal = b.percentage;
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sorting by sortBy option
      if (sortBy === 'most') {
        sorted.sort((a, b) => b.totalStudents - a.totalStudents);
      } else if (sortBy === 'least') {
        sorted.sort((a, b) => a.totalStudents - b.totalStudents);
      } else if (sortBy === 'az') {
        sorted.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
      } else if (sortBy === 'recent') {
        sorted.sort((a, b) => {
          const dateA = a.lastEnrolment ? new Date(a.lastEnrolment).getTime() : 0;
          const dateB = b.lastEnrolment ? new Date(b.lastEnrolment).getTime() : 0;
          return dateB - dateA;
        });
      }
    }

    return sorted;
  }, [enhancedReport, searchTerm, statusFilter, sortBy, sortColumn, sortDirection]);

  const handleSort = (column: 'title' | 'students' | 'percentage') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    closeModal();
    const headers = ['Course Title', 'Total Students', '% of Total', 'Last Enrolment', 'Status'];
    const rows = filteredAndSortedReport.map(row => [
      row.courseTitle,
      row.totalStudents,
      `${row.percentage}%`,
      row.lastEnrolment ? new Date(row.lastEnrolment).toLocaleDateString() : 'Never',
      row.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrolment-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    closeModal();
    const data = {
      generated: new Date().toISOString(),
      summary: kpis,
      courses: filteredAndSortedReport
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrolment-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('report.title')}</h1>
        <p className="text-slate-600 mt-2">{t('report.subtitle')}</p>
      </div>

      {error && <ErrorBanner message={error} onClose={() => dispatch(clearError())} />}

      {report.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium text-slate-900 mb-2">No data available yet</p>
          <p className="text-slate-500">Start by creating courses and assigning students to see analytics here.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards - All Clickable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 kpi-card-clickable"
              onClick={() => openKpiModal('total-courses')}
              title="Click to view all courses"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{t('report.kpis.totalCourses')}</span>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-blue-900">{kpis.totalCourses}</div>
              <div className="text-xs text-blue-600 mt-2 opacity-70">Click for details →</div>
            </div>

            <div 
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 kpi-card-clickable"
              onClick={() => openKpiModal('total-enrolments')}
              title="Click to view all enrolments"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">{t('report.kpis.totalEnrolments')}</span>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-green-900">{kpis.totalEnrolments}</div>
              <div className="text-xs text-green-600 mt-2 opacity-70">Click for breakdown →</div>
            </div>

            <div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 kpi-card-clickable"
              onClick={() => openKpiModal('active-courses')}
              title="Click to view active courses"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t('report.kpis.activeCourses')}</span>
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-purple-900">{kpis.activeCourses}</div>
              <div className="text-xs text-purple-600 mt-1">{kpis.activeCourses} / {kpis.totalCourses} courses</div>
              <div className="text-xs text-purple-600 mt-1 opacity-70">Click to explore →</div>
            </div>

            <div 
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 kpi-card-clickable"
              onClick={() => openKpiModal('idle-courses')}
              title="Click to view idle courses"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{t('report.kpis.idleCourses')}</span>
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-slate-900">{kpis.idleCourses}</div>
              <div className="text-xs text-slate-600 mt-1">Need attention</div>
              <div className="text-xs text-slate-600 mt-1 opacity-70">Click for list →</div>
            </div>

            <div 
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200 kpi-card-clickable"
              onClick={() => openKpiModal('avg-students')}
              title="Click to view calculation"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{t('report.kpis.avgEnrolments')}</span>
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-amber-900">{kpis.avgStudents}</div>
              <div className="text-xs text-amber-600 mt-1">Per course</div>
              <div className="text-xs text-amber-600 mt-1 opacity-70">Click for details →</div>
            </div>
          </div>

          {/* Time-based Insights - All Clickable */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div 
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm insight-card-clickable"
              onClick={() => openKpiModal('new-this-week')}
              title="Click to view this week's enrolments"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-slate-900">{kpis.newThisWeek}</div>
                  <div className="text-sm text-slate-600">New this week</div>
                  <div className="text-xs text-blue-600 mt-1 opacity-70">Click to view →</div>
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm insight-card-clickable"
              onClick={() => openKpiModal('new-this-month')}
              title="Click to view this month's enrolments"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-slate-900">{kpis.newThisMonth}</div>
                  <div className="text-sm text-slate-600">New this month</div>
                  <div className="text-xs text-green-600 mt-1 opacity-70">Click to view →</div>
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm insight-card-clickable"
              onClick={() => openKpiModal('most-active')}
              title="Click to view top performing course"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{kpis.mostActiveCourse}</div>
                  <div className="text-xs text-slate-600">Most active (7 days)</div>
                  <div className="text-xs text-purple-600 mt-1 opacity-70">Click for analytics →</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Controls */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as SortOption); setSortColumn(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="most">Most Students</option>
                  <option value="least">Least Students</option>
                  <option value="az">A-Z</option>
                  <option value="recent">Recently Active</option>
                </select>

                <button
                  onClick={() => openExportPreview('csv')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 export-button-clickable"
                  title="Export report as CSV"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>

                <button
                  onClick={() => openExportPreview('json')}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 export-button-clickable"
                  title="Export report as JSON"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  JSON
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
              <span>Showing {filteredAndSortedReport.length} of {report.length} courses</span>
              <span className="text-slate-400">•</span>
              <span>Report generated: {new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Advanced Report Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th 
                      onClick={() => handleSort('title')}
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Course Title
                        {sortColumn === 'title' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('students')}
                      className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        Students
                        {sortColumn === 'students' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('percentage')}
                      className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        % of Total
                        {sortColumn === 'percentage' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Last Enrolment
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredAndSortedReport.map((row, index) => {
                    const isTopCourse = index === 0 && sortBy === 'most';
                    return (
                      <tr 
                        key={row.courseId} 
                        className={`table-row-clickable ${isTopCourse ? 'bg-blue-50' : ''}`}
                        onClick={() => openCourseModal(row)}
                        title="Click to view course analytics"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isTopCourse && (
                              <svg 
                                className="w-5 h-5 text-amber-500 cursor-pointer hover:scale-110 transition-transform" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                                onClick={(e) => { e.stopPropagation(); openKpiModal('top-course'); }}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">{row.courseTitle}</div>
                              {/* Progress Bar - Clickable */}
                              <div 
                                className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden progress-bar-clickable"
                                onClick={(e) => { e.stopPropagation(); openKpiModal('course-ranking'); }}
                                title="Click to see course ranking"
                              >
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(row.percentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 text-center"
                          onClick={(e) => { e.stopPropagation(); setSelectedCourse(row); openKpiModal('enrolled-students'); }}
                        >
                          <span className="text-2xl font-bold text-slate-900 cell-clickable" title="Click to view enrolled students">
                            {row.totalStudents}
                          </span>
                        </td>
                        <td 
                          className="px-6 py-4 text-center"
                          onClick={(e) => { e.stopPropagation(); setSelectedCourse(row); openKpiModal('percentage-breakdown'); }}
                        >
                          <span className="text-lg font-semibold text-slate-700 cell-clickable" title="Click to view percentage breakdown">
                            {row.percentage}%
                          </span>
                        </td>
                        <td 
                          className="px-6 py-4 text-center"
                          onClick={(e) => { e.stopPropagation(); setSelectedCourse(row); openKpiModal('activity-timeline'); }}
                        >
                          <span className="text-sm text-slate-600 cell-clickable" title="Click to view activity timeline">
                            {row.lastEnrolment ? new Date(row.lastEnrolment).toLocaleDateString() : 'Never'}
                          </span>
                        </td>
                        <td 
                          className="px-6 py-4 text-center"
                          onClick={(e) => { e.stopPropagation(); setSelectedCourse(row); openKpiModal('status-explanation'); }}
                        >
                          <span 
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold status-badge-clickable ${
                              row.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-slate-100 text-slate-600'
                            }`}
                            title="Click for status explanation"
                          >
                            {row.status === 'active' ? '● Active' : '○ Idle'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-center text-lg font-bold text-slate-900">
                      {filteredAndSortedReport.reduce((sum, row) => sum + row.totalStudents, 0)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                      100%
                    </td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Content - All Drill-Down Scenarios */}
      
      {/* Total Courses Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'total-courses'}
        onClose={closeModal}
        title="All Courses Overview"
        breadcrumb="Analytics → Total Courses"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📚 Total Courses</h3>
            <p className="text-blue-700">You have <strong>{kpis.totalCourses}</strong> courses in your system.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-1">Active Courses</div>
              <div className="text-3xl font-bold text-green-900">{kpis.activeCourses}</div>
              <div className="text-xs text-green-600 mt-1">With ≥1 student</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-700 mb-1">Idle Courses</div>
              <div className="text-3xl font-bold text-slate-900">{kpis.idleCourses}</div>
              <div className="text-xs text-slate-600 mt-1">Need students</div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">Course</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-700">Students</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enhancedReport.map(course => (
                  <tr key={course.courseId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{course.courseTitle}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-slate-900">{course.totalStudents}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnalyticsModal>

      {/* Total Enrolments Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'total-enrolments'}
        onClose={closeModal}
        title="Total Enrolments Breakdown"
        breadcrumb="Analytics → Total Enrolments"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">👥 Total Enrolments</h3>
            <p className="text-green-700">
              <strong>{kpis.totalEnrolments}</strong> total enrolments across <strong>{kpis.totalCourses}</strong> courses
            </p>
          </div>

          <div className="space-y-3">
            {enhancedReport
              .sort((a, b) => b.totalStudents - a.totalStudents)
              .map(course => (
                <div key={course.courseId} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-900">{course.courseTitle}</span>
                    <span className="text-2xl font-bold text-blue-600">{course.totalStudents}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${course.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{course.percentage}% of total</div>
                </div>
              ))}
          </div>
        </div>
      </AnalyticsModal>

      {/* Active Courses Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'active-courses'}
        onClose={closeModal}
        title="Active Courses"
        breadcrumb="Analytics → Active Courses"
      >
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">⚡ Active Courses</h3>
            <p className="text-purple-700">
              <strong>{kpis.activeCourses}</strong> courses have at least one enrolled student
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {enhancedReport
              .filter(c => c.status === 'active')
              .sort((a, b) => b.totalStudents - a.totalStudents)
              .map(course => (
                <div key={course.courseId} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{course.courseTitle}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Last activity: {course.lastEnrolment ? new Date(course.lastEnrolment).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <span className="text-xl font-bold text-green-700">{course.totalStudents} 👥</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </AnalyticsModal>

      {/* Idle Courses Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'idle-courses'}
        onClose={closeModal}
        title="Idle Courses - Need Attention"
        breadcrumb="Analytics → Idle Courses"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">⚠️ Idle Courses</h3>
            <p className="text-amber-700">
              <strong>{kpis.idleCourses}</strong> courses have no enrolled students yet
            </p>
          </div>

          {kpis.idleCourses === 0 ? (
            <div className="text-center py-8 text-green-600">
              <svg className="w-16 h-16 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold text-lg">Excellent! All courses are active!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {enhancedReport
                .filter(c => c.status === 'idle')
                .map(course => (
                  <div key={course.courseId} className="border border-slate-300 bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{course.courseTitle}</h4>
                        <p className="text-sm text-slate-600 mt-2">
                          <strong>Recommendation:</strong> Promote this course to attract students
                        </p>
                      </div>
                      <span className="text-slate-400">0 👥</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </AnalyticsModal>

      {/* Average Students Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'avg-students'}
        onClose={closeModal}
        title="Average Students Per Course"
        breadcrumb="Analytics → Average Students"
      >
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">📊 Calculation</h3>
            <div className="text-amber-700 space-y-2">
              <p><strong>Total Enrolments:</strong> {kpis.totalEnrolments}</p>
              <p><strong>Total Courses:</strong> {kpis.totalCourses}</p>
              <div className="border-t border-amber-300 my-2 pt-2">
                <p className="text-lg"><strong>Average:</strong> {kpis.avgStudents} students per course</p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-slate-900">Per-Course Breakdown</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {enhancedReport
              .sort((a, b) => b.totalStudents - a.totalStudents)
              .map(course => {
                const avgDiff = course.totalStudents - parseFloat(kpis.avgStudents);
                const isAboveAvg = avgDiff > 0;
                return (
                  <div key={course.courseId} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300">
                    <span className="text-sm text-slate-900">{course.courseTitle}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{course.totalStudents}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isAboveAvg ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isAboveAvg ? `+${avgDiff.toFixed(1)}` : avgDiff.toFixed(1)} avg
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </AnalyticsModal>

      {/* New This Week Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'new-this-week'}
        onClose={closeModal}
        title="New Enrolments This Week"
        breadcrumb="Analytics → Time Insights → This Week"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📅 Last 7 Days</h3>
            <p className="text-blue-700">
              <strong>{kpis.newThisWeek}</strong> new enrolments in the past week
            </p>
          </div>

          {kpis.newThisWeek === 0 ? (
            <p className="text-center text-slate-500 py-8">No enrolments this week</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {enrolments
                .filter(e => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return new Date(e.enrolledAt) >= weekAgo;
                })
                .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                .map((enrolment, idx) => (
                  <div key={idx} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">{enrolment.studentName}</p>
                        <p className="text-sm text-slate-600">{enrolment.courseTitle}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(enrolment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </AnalyticsModal>

      {/* New This Month Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'new-this-month'}
        onClose={closeModal}
        title="New Enrolments This Month"
        breadcrumb="Analytics → Time Insights → This Month"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">📅 Last 30 Days</h3>
            <p className="text-green-700">
              <strong>{kpis.newThisMonth}</strong> new enrolments in the past month
            </p>
          </div>

          {kpis.newThisMonth === 0 ? (
            <p className="text-center text-slate-500 py-8">No enrolments this month</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {enrolments
                .filter(e => {
                  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                  return new Date(e.enrolledAt) >= monthAgo;
                })
                .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                .map((enrolment, idx) => (
                  <div key={idx} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">{enrolment.studentName}</p>
                        <p className="text-sm text-slate-600">{enrolment.courseTitle}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(enrolment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </AnalyticsModal>

      {/* Most Active Course Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'most-active'}
        onClose={closeModal}
        title="Most Active Course (Last 7 Days)"
        breadcrumb="Analytics → Time Insights → Most Active"
      >
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">🏆 Top Performer</h3>
            <p className="text-purple-700 text-lg">
              <strong>{kpis.mostActiveCourse}</strong>
            </p>
            <p className="text-sm text-purple-600 mt-1">Most new enrolments in the past 7 days</p>
          </div>

          <div className="space-y-3">
            {Object.entries(
              enrolments
                .filter(e => new Date(e.enrolledAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                .reduce((acc, e) => {
                  const title = e.courseTitle || 'Unknown Course';
                  acc[title] = (acc[title] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => b - a)
              .map(([courseTitle, count], idx) => (
                <div 
                  key={courseTitle} 
                  className={`border rounded-lg p-4 ${idx === 0 ? 'border-purple-300 bg-purple-50' : 'border-slate-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="text-xl">🏆</span>}
                      <span className="font-medium text-slate-900">{courseTitle}</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">+{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </AnalyticsModal>

      {/* Course Details Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'course-details' && selectedCourse !== null}
        onClose={closeModal}
        title={selectedCourse?.courseTitle || 'Course Analytics'}
        breadcrumb={`Analytics → Courses → ${selectedCourse?.courseTitle}`}
        size="xl"
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-blue-700 mb-1">Total Students</div>
                <div className="text-3xl font-bold text-blue-900">{selectedCourse.totalStudents}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-xs text-green-700 mb-1">% of Total</div>
                <div className="text-3xl font-bold text-green-900">{selectedCourse.percentage}%</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-xs text-purple-700 mb-1">Status</div>
                <div className="text-xl font-bold text-purple-900 capitalize">{selectedCourse.status}</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">📅 Activity Timeline</h3>
              <p className="text-sm text-slate-600">
                <strong>Last Enrolment:</strong> {selectedCourse.lastEnrolment 
                  ? new Date(selectedCourse.lastEnrolment).toLocaleDateString() 
                  : 'No enrolments yet'}
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">👥 Enrolled Students</h3>
              {selectedCourse.enrolments.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No students enrolled yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedCourse.enrolments
                    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                    .map((enrolment, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-900">{enrolment.studentName}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(enrolment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">💡 Insights & Recommendations</h3>
              {selectedCourse.status === 'idle' ? (
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• This course has no enrolled students</li>
                  <li>• Consider promoting it to attract learners</li>
                  <li>• Review course description and marketing materials</li>
                </ul>
              ) : (
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Course is performing well with {selectedCourse.totalStudents} students</li>
                  <li>• Represents {selectedCourse.percentage}% of all enrolments</li>
                  <li>• {selectedCourse.totalStudents > parseFloat(kpis.avgStudents) 
                    ? '✓ Above average enrolment rate' 
                    : '• Consider strategies to increase enrolments'}</li>
                </ul>
              )}
            </div>
          </div>
        )}
      </AnalyticsModal>

      {/* Enrolled Students Modal (Cell Click) */}
      <AnalyticsModal
        isOpen={activeModal === 'enrolled-students' && selectedCourse !== null}
        onClose={closeModal}
        title="Enrolled Students"
        breadcrumb={`Analytics → ${selectedCourse?.courseTitle} → Students`}
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">{selectedCourse.courseTitle}</h3>
              <p className="text-blue-700 mt-1">
                <strong>{selectedCourse.totalStudents}</strong> enrolled students
              </p>
            </div>

            {selectedCourse.enrolments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No students enrolled</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedCourse.enrolments
                  .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                  .map((enrolment, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">{enrolment.studentName}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Enrolled: {new Date(enrolment.enrolledAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </AnalyticsModal>

      {/* Percentage Breakdown Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'percentage-breakdown' && selectedCourse !== null}
        onClose={closeModal}
        title="Percentage Analysis"
        breadcrumb={`Analytics → ${selectedCourse?.courseTitle} → Percentage`}
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">{selectedCourse.courseTitle}</h3>
              <p className="text-green-700">
                Accounts for <strong>{selectedCourse.percentage}%</strong> of total enrolments
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">This course:</span>
                  <span className="font-bold text-slate-900">{selectedCourse.totalStudents} students</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total enrolments:</span>
                  <span className="font-bold text-slate-900">{kpis.totalEnrolments} students</span>
                </div>
                <div className="border-t border-slate-300 pt-3 flex justify-between">
                  <span className="text-slate-700 font-semibold">Share:</span>
                  <span className="text-2xl font-bold text-green-600">{selectedCourse.percentage}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Comparison with Other Courses</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {enhancedReport
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((course, idx) => (
                    <div 
                      key={course.courseId} 
                      className={`p-3 rounded-lg ${
                        course.courseId === selectedCourse.courseId 
                          ? 'bg-green-100 border-2 border-green-400' 
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-900">
                          {idx + 1}. {course.courseTitle}
                        </span>
                        <span className="font-bold text-slate-900">{course.percentage}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </AnalyticsModal>

      {/* Activity Timeline Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'activity-timeline' && selectedCourse !== null}
        onClose={closeModal}
        title="Activity Timeline"
        breadcrumb={`Analytics → ${selectedCourse?.courseTitle} → Timeline`}
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900">{selectedCourse.courseTitle}</h3>
              <p className="text-purple-700 mt-1">
                Last activity: <strong>
                  {selectedCourse.lastEnrolment 
                    ? new Date(selectedCourse.lastEnrolment).toLocaleDateString() 
                    : 'Never'}
                </strong>
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">📅 Enrolment History</h4>
              {selectedCourse.enrolments.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No activity yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedCourse.enrolments
                    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                    .map((enrolment, idx) => {
                      const daysAgo = Math.floor(
                        (Date.now() - new Date(enrolment.enrolledAt).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <div key={idx} className="flex items-start gap-3 relative">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            {idx < selectedCourse.enrolments.length - 1 && (
                              <div className="w-0.5 h-12 bg-slate-300"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <p className="font-medium text-slate-900">{enrolment.studentName} enrolled</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(enrolment.enrolledAt).toLocaleString()} 
                              ({daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`})
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </AnalyticsModal>

      {/* Status Explanation Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'status-explanation' && selectedCourse !== null}
        onClose={closeModal}
        title="Course Status Explanation"
        breadcrumb={`Analytics → ${selectedCourse?.courseTitle} → Status`}
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className={`border rounded-lg p-4 ${
              selectedCourse.status === 'active' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                selectedCourse.status === 'active' ? 'text-green-900' : 'text-slate-900'
              }`}>
                {selectedCourse.courseTitle}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedCourse.status === 'active' 
                    ? 'bg-green-200 text-green-900' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {selectedCourse.status === 'active' ? '● Active' : '○ Idle'}
                </span>
                <span className={selectedCourse.status === 'active' ? 'text-green-700' : 'text-slate-600'}>
                  {selectedCourse.totalStudents} student{selectedCourse.totalStudents !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">📋 Status Criteria</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-slate-900">Active</p>
                    <p className="text-sm text-slate-600">Course has ≥1 enrolled student</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-slate-900">Idle</p>
                    <p className="text-sm text-slate-600">Course has 0 enrolled students</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedCourse.status === 'idle' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">💡 Recommendations</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Review and improve course description</li>
                  <li>• Add promotional materials or preview content</li>
                  <li>• Consider targeted marketing campaigns</li>
                  <li>• Check if course prerequisites are too restrictive</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </AnalyticsModal>

      {/* Course Ranking Modal (Progress Bar Click) */}
      <AnalyticsModal
        isOpen={activeModal === 'course-ranking'}
        onClose={closeModal}
        title="Course Performance Ranking"
        breadcrumb="Analytics → Rankings"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">🏆 Performance Rankings</h3>
            <p className="text-amber-700">Courses ranked by total enrolled students</p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {enhancedReport
              .sort((a, b) => b.totalStudents - a.totalStudents)
              .map((course, idx) => (
                <div 
                  key={course.courseId}
                  className={`border rounded-lg p-4 transition-all ${
                    idx === 0 ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-md' :
                    idx === 1 ? 'border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100' :
                    idx === 2 ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50' :
                    'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl font-bold ${
                      idx === 0 ? 'text-amber-600' :
                      idx === 1 ? 'text-slate-500' :
                      idx === 2 ? 'text-orange-600' :
                      'text-slate-400'
                    }`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{course.courseTitle}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-slate-600">
                          <strong>{course.totalStudents}</strong> students
                        </span>
                        <span className="text-sm text-slate-600">
                          <strong>{course.percentage}%</strong> of total
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            idx === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                            idx === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                            idx === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${course.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </AnalyticsModal>

      {/* Top Course Modal (Star Icon Click) */}
      <AnalyticsModal
        isOpen={activeModal === 'top-course'}
        onClose={closeModal}
        title="Top Performing Course"
        breadcrumb="Analytics → Top Performer"
      >
        {enhancedReport.length > 0 && (
          <div className="space-y-4">
            {(() => {
              const topCourse = enhancedReport.sort((a, b) => b.totalStudents - a.totalStudents)[0];
              return (
                <>
                  <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-400 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <svg className="w-12 h-12 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div>
                        <h3 className="text-2xl font-bold text-amber-900">{topCourse.courseTitle}</h3>
                        <p className="text-amber-700">🏆 #1 Most Enrolled Course</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-900">{topCourse.totalStudents}</div>
                        <div className="text-xs text-amber-700 mt-1">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-900">{topCourse.percentage}%</div>
                        <div className="text-xs text-amber-700 mt-1">Market Share</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-900">
                          {topCourse.lastEnrolment 
                            ? Math.floor((Date.now() - new Date(topCourse.lastEnrolment).getTime()) / (1000 * 60 * 60 * 24))
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-amber-700 mt-1">Days Since Last</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                    <h4 className="font-semibold text-amber-900 mb-3">🎯 Why This Course Excels</h4>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Highest enrollment count among all courses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Captures {topCourse.percentage}% of total student base</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          {topCourse.totalStudents > parseFloat(kpis.avgStudents) * 1.5
                            ? 'Significantly exceeds average enrollment'
                            : 'Performing above expectations'}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📚 Recent Enrollments</h4>
                    {!topCourse.enrolments || topCourse.enrolments.length === 0 ? (
                      <p className="text-sm text-blue-700">No enrollment data available</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {topCourse.enrolments
                          .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                          .slice(0, 5)
                          .map((e, idx) => (
                            <div key={idx} className="text-sm text-blue-700 flex justify-between">
                              <span>{e.studentName}</span>
                              <span className="text-xs text-blue-600">
                                {new Date(e.enrolledAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </AnalyticsModal>

      {/* Export Preview Modal */}
      <AnalyticsModal
        isOpen={activeModal === 'export-preview'}
        onClose={closeModal}
        title={`Export as ${exportPreview?.type?.toUpperCase() || 'FILE'}`}
        breadcrumb={`Analytics → Export → ${exportPreview?.type?.toUpperCase() || 'FILE'}`}
      >
        {exportPreview && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📄 Export Summary</h3>
              <p className="text-blue-700">
                Ready to export <strong>{filteredAndSortedReport?.length || 0}</strong> courses
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="font-semibold text-slate-900 mb-2">Preview</h4>
              <div className="bg-white rounded p-3 text-xs font-mono overflow-x-auto max-h-64">
                {exportPreview.type === 'csv' ? (
                  <pre>
                    Course Title,Total Students,% of Total,Last Enrolment,Status{'\n'}
                    {filteredAndSortedReport && filteredAndSortedReport.length > 0 
                      ? filteredAndSortedReport.slice(0, 5).map(row => 
                          `${row.courseTitle},${row.totalStudents},${row.percentage}%,${row.lastEnrolment ? new Date(row.lastEnrolment).toLocaleDateString() : 'Never'},${row.status}`
                        ).join('\n')
                      : 'No data to export'
                    }
                    {filteredAndSortedReport && filteredAndSortedReport.length > 5 ? '\n... and more' : ''}
                  </pre>
                ) : (
                  <pre>{exportPreview.data ? JSON.stringify(exportPreview.data, null, 2).slice(0, 500) : 'No data'}...</pre>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportPreview.type === 'csv' ? exportToCSV : exportToJSON}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Download {exportPreview.type?.toUpperCase()}
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </AnalyticsModal>
    </div>
  );
};
