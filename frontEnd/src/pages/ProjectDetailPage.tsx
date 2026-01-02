import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsApi } from '../api/client';
import { Project } from '../types/api';
import { ArrowLeft, MapPin, Calendar, User, Tag } from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getById(id!);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedTitle = (project: Project) => {
    switch (i18n.language) {
      case 'ar': return project.titleAr;
      case 'he': return project.titleHe;
      default: return project.titleEn || project.titleHe;
    }
  };

  const getLocalizedDescription = (project: Project) => {
    switch (i18n.language) {
      case 'ar': return project.descriptionAr;
      case 'he': return project.descriptionHe;
      default: return project.descriptionEn || project.descriptionHe;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
            Project not found
          </h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-primary-500 hover:underline"
          >
            {t('projects.details.backToProjects')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('projects.details.backToProjects')}
        </button>

        {/* Project Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-dark-900 dark:text-white">
          {getLocalizedTitle(project)}
        </h1>

        {/* Project Meta */}
        <div className="flex flex-wrap gap-6 mb-8 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            <span>{t(`projects.filter.${project.category}`)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span>{project.location}</span>
          </div>
          {project.completionDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(project.completionDate).toLocaleDateString()}</span>
            </div>
          )}
          {project.clientName && (
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{project.clientName}</span>
            </div>
          )}
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {t(`projects.status.${project.status}`)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Images Gallery */}
          <div className="lg:col-span-2">
            {project.images && project.images.length > 0 ? (
              <div>
                {/* Main Image */}
                <div className="bg-gray-200 dark:bg-dark-800 rounded-lg overflow-hidden mb-4 h-96">
                  <img
                    src={`http://localhost:5000${project.images[selectedImage]}`}
                    alt={getLocalizedTitle(project)}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thumbnail Grid */}
                {project.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {project.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`h-24 rounded-lg overflow-hidden transition-all ${
                          selectedImage === index
                            ? 'ring-4 ring-primary-500'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={`http://localhost:5000${image}`}
                          alt={`${getLocalizedTitle(project)} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-200 dark:bg-dark-800 rounded-lg h-96 flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-dark-900 dark:text-white">
                {t('projects.details.category')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                {getLocalizedDescription(project)}
              </p>
              
              {/* CTA */}
              <a
                href="/contact"
                className="block w-full bg-gradient-gold text-dark-900 text-center px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                {t('actions.getQuote')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
