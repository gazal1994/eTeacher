import { useTranslation } from 'react-i18next';
import { Building2, ShoppingBag, Construction, Wrench, FileText, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function ServicesPage() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Building2,
      key: 'residential',
    },
    {
      icon: ShoppingBag,
      key: 'commercial',
    },
    {
      icon: Construction,
      key: 'infrastructure',
    },
    {
      icon: Wrench,
      key: 'renovation',
    },
    {
      icon: FileText,
      key: 'consultation',
    },
    {
      icon: ClipboardList,
      key: 'management',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section 
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2070&auto=format&fit=crop)',
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
                {t('services.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                {t('services.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <Section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {services.map((service, index) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover className="h-full group">
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 bg-primary-500/5 rounded-premium-lg flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors duration-300">
                    <service.icon className="w-8 h-8 text-primary-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-dark-900 tracking-tight">
                    {t(`services.${service.key}.title`)}
                  </h3>
                  <p className="text-dark-600 leading-relaxed flex-grow">
                    {t(`services.${service.key}.description`)}
                  </p>
                  <div className="h-px bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 mt-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA Section with Background */}
      <section 
        className="relative py-20 md:py-32 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900/95 via-dark-900/90 to-dark-900/95"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <motion.h2
              className="text-display-sm md:text-display-md font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t('actions.getQuote')}
            </motion.h2>
            <motion.p
              className="text-xl md:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {t('common.slogan')}
            </motion.p>
            <motion.div 
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
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
        </div>
      </section>
    </div>
  );
}
