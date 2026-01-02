import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Edit2, Trash2 } from 'lucide-react';
import { projectsApi, leadsApi } from '../api/client';
import type { Project, Lead } from '../types/api';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [projectsData, leadsData] = await Promise.all([
        projectsApi.getAll(),
        leadsApi.getAll(),
      ]);
      setProjects(projectsData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm(t('admin.projects.confirmDelete'))) return;
    
    try {
      await projectsApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      await leadsApi.updateStatus(id, status);
      await loadData();
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 shadow">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            {t('admin.dashboard.title')}
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('admin.dashboard.logout')}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Projects Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-white">
              {t('admin.projects.title')}
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-gold text-dark-900 rounded-lg hover:shadow-lg transition-all">
              <Plus className="w-5 h-5" />
              {t('admin.projects.add')}
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-dark-800 rounded-lg overflow-hidden shadow-lg"
              >
                {project.images && project.images.length > 0 && (
                  <img
                    src={project.images[0]}
                    alt={project.titleAr}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-dark-900 dark:text-white">
                    {project.titleEn}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {project.category} • {project.status}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-dark-900 rounded-lg hover:bg-primary-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                      {t('actions.edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('actions.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads Section */}
        <div>
          <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
            {t('admin.leads.title')}
          </h2>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('contact.form.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('contact.form.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('contact.form.projectType')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('admin.leads.updateStatus')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900 dark:text-white">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {lead.projectType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            lead.status === 'new'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : lead.status === 'contacted'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleUpdateLeadStatus(lead.id, e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 dark:border-dark-700 rounded bg-white dark:bg-dark-900 text-dark-900 dark:text-white"
                        >
                          <option value="new">{t('admin.leads.new')}</option>
                          <option value="contacted">
                            {t('admin.leads.contacted')}
                          </option>
                          <option value="closed">{t('admin.leads.closed')}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
