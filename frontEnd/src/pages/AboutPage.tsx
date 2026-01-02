import { useTranslation } from 'react-i18next';
import { Award, Target, Heart, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section, SectionHeader } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function AboutPage() {
  const { t } = useTranslation();

  const values = [
    { icon: Award, key: 'quality' },
    { icon: Heart, key: 'integrity' },
    { icon: Lightbulb, key: 'innovation' },
    { icon: Target, key: 'commitment' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section 
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2070&auto=format&fit=crop)',
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
                {t('about.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                {t('about.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-display-sm font-bold mb-8 text-dark-900 tracking-tight">
              {t('about.story.title')}
            </h2>
            <div className="space-y-6 text-lg text-dark-600 leading-relaxed">
              <p>{t('about.story.paragraph1')}</p>
              <p>{t('about.story.paragraph2')}</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Mission Section */}
      <Section background="gray">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-display-sm font-bold mb-8 text-dark-900 tracking-tight">
              {t('about.mission.title')}
            </h2>
            <p className="text-xl md:text-2xl text-dark-600 leading-relaxed">
              {t('about.mission.description')}
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Values Section */}
      <Section>
        <SectionHeader 
          title={t('about.values.title')}
          centered
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {values.map((value, index) => (
            <motion.div
              key={value.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-primary-500/5 rounded-premium-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500 transition-colors duration-300">
                <value.icon className="w-10 h-10 text-primary-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 tracking-tight">
                {t(`about.values.${value.key}`)}
              </h3>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Team Section */}
      <Section background="gray">
        <SectionHeader 
          title={t('about.team.title')}
          centered
        />
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center h-full">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold mb-2 text-dark-900 tracking-tight">
                {t('about.team.saeed.name')}
              </h3>
              <p className="text-dark-600">
                {t('about.team.saeed.role')}
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center h-full">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold mb-2 text-dark-900 tracking-tight">
                {t('about.team.shadi.name')}
              </h3>
              <p className="text-dark-600">
                {t('about.team.shadi.role')}
              </p>
            </Card>
          </motion.div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="dark">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-display-sm font-bold mb-8 text-white tracking-tight">
              {t('actions.getQuote')}
            </h2>
            <Button 
              as="a" 
              href="/contact" 
              variant="secondary" 
              size="lg"
            >
              {t('nav.contact')}
            </Button>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
