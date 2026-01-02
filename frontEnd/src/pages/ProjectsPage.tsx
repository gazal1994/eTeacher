import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsApi } from '../api/client';
import { Project } from '../types/api';
import { MapPin, Calendar } from 'lucide-react';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import clsx from 'clsx';
import { mockProjects } from '../data/mockProjects';

export function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, [filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { category: filter } : {};
      const data = await projectsApi.getAll(filters);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      // Use mock data if API is unavailable
      const filtered = filter !== 'all' 
        ? mockProjects.filter(p => p.category === filter)
        : mockProjects;
      setProjects(filtered);
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

  const categories = ['all', 'residential', 'commercial', 'infrastructure'];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section 
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900/90 via-dark-900/85 to-dark-900/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-display-lg md:text-display-xl font-bold mb-6 text-white">
                {t('projects.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                {t('projects.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <Section className="pt-12 pb-0">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setFilter(category)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'px-6 py-3 rounded-premium font-semibold transition-all duration-300',
                filter === category
                  ? 'bg-dark-900 text-white shadow-premium'
                  : 'bg-white text-dark-700 hover:bg-dark-50 border border-dark-100'
              )}
            >
              {t(`projects.filter.${category}`)}
            </motion.button>
          ))}
        </div>
      </Section>

      {/* Projects Grid */}
      <Section>
        {loading ? (
          <div className="text-center py-20">
            <motion.div
              className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-dark-600">
              {t('projects.noProjects')}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/projects/${project.id}`} className="block h-full group">
                  <Card hover className="h-full overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
                    {/* Project Image */}
                    <div className="relative h-64 bg-dark-50 overflow-hidden">
                      {project.images && project.images.length > 0 ? (
                        <img
                          src={project.images[0].startsWith('http') ? project.images[0] : `http://localhost:5000${project.images[0]}`}
                          alt={getLocalizedTitle(project)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark-400">
                          No Image
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="bg-primary-500 text-dark-900 px-3 py-1.5 rounded-premium text-sm font-semibold backdrop-blur-sm shadow-premium">
                          {t(`projects.filter.${project.category}`)}
                        </span>
                      </div>
                      {/* Premium gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Project Info */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3 text-dark-900 group-hover:text-primary-500 transition-colors duration-300 tracking-tight">
                        {getLocalizedTitle(project)}
                      </h3>
                      <p className="text-dark-600 mb-4 line-clamp-2 leading-relaxed">
                        {getLocalizedDescription(project)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-dark-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{project.location}</span>
                        </div>
                        {project.completionDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(project.completionDate).getFullYear()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
