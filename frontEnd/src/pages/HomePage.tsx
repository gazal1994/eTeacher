import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building2, Users, Award, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Section, SectionHeader } from '../components/ui/Section';

export function HomePage() {
  const { t } = useTranslation();

  const stats = [
    { icon: Building2, value: '150+', label: t('home.stats.projects') },
    { icon: Users, value: '500+', label: t('home.stats.clients') },
    { icon: Clock, value: '15+', label: t('home.stats.experience') },
    { icon: Award, value: '50+', label: t('home.stats.team') },
  ];

  const features = [
    {
      title: t('home.whyUs.quality.title'),
      description: t('home.whyUs.quality.description'),
    },
    {
      title: t('home.whyUs.experience.title'),
      description: t('home.whyUs.experience.description'),
    },
    {
      title: t('home.whyUs.time.title'),
      description: t('home.whyUs.time.description'),
    },
    {
      title: t('home.whyUs.price.title'),
      description: t('home.whyUs.price.description'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900/95 via-dark-900/85 to-dark-900/90"></div>
        
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            className="max-w-4xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-display-xl md:text-display-2xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {t('home.hero.title')}
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-12 text-gray-200 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {t('home.hero.subtitle')}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link to="/projects">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto group">
                  {t('home.hero.cta')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-dark-900">
                  {t('home.hero.contact')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/60 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <Section background="white" className="py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-premium-lg bg-dark-50">
                <stat.icon className="w-8 h-8 text-dark-900" strokeWidth={1.5} />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-dark-900 mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-dark-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Why Choose Us Section */}
      <Section background="gray">
        <SectionHeader 
          title={t('home.whyUs.title')}
          subtitle="Building excellence through dedication and expertise"
        />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} hover className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-premium bg-primary-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary-600" strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-dark-900">
                    {feature.title}
                  </h3>
                  <p className="text-dark-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA Section with Background */}
      <section 
        className="relative py-20 md:py-32 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900/95 via-dark-900/90 to-dark-900/95"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-3xl mx-auto">
            <motion.h2 
              className="text-display-md md:text-display-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t('actions.getQuote')}
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-200 mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {t('common.slogan')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="group">
                  {t('nav.contact')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
