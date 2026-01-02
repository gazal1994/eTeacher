import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { leadsApi } from '../api/client';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await leadsApi.create(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        message: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('contact.form.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    { icon: Phone, label: t('contact.info.phone'), value: t('common.phone') },
    { icon: Mail, label: t('contact.info.email'), value: t('common.email') },
    { icon: MapPin, label: t('contact.info.address'), value: t('common.address') },
    { icon: Clock, label: t('contact.info.hours'), value: t('contact.info.hoursValue') },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section 
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop)',
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
                {t('contact.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                {t('contact.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-dark-900">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-premium border border-dark-200 bg-white text-dark-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-dark-900">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-premium border border-dark-200 bg-white text-dark-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-dark-900">
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-premium border border-dark-200 bg-white text-dark-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-dark-900">
                    {t('contact.form.projectType')}
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-premium border border-dark-200 bg-white text-dark-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  >
                    <option value="">{t('contact.form.selectProjectType')}</option>
                    <option value="residential">{t('contact.projectTypes.residential')}</option>
                    <option value="commercial">{t('contact.projectTypes.commercial')}</option>
                    <option value="infrastructure">{t('contact.projectTypes.infrastructure')}</option>
                    <option value="renovation">{t('contact.projectTypes.renovation')}</option>
                    <option value="other">{t('contact.projectTypes.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-dark-900">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-premium border border-dark-200 bg-white text-dark-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                  />
                </div>

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 text-green-800 px-4 py-3 rounded-premium border border-green-200"
                  >
                    {t('contact.form.success')}
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-800 px-4 py-3 rounded-premium border border-red-200"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {loading ? t('contact.form.sending') : t('contact.form.send')}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <h2 className="text-2xl font-bold mb-8 text-dark-900 tracking-tight">
                  {t('contact.info.title')}
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-12 h-12 bg-primary-500/5 rounded-premium flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-primary-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-dark-900 mb-1">
                          {item.label}
                        </div>
                        <div className="text-dark-600">
                          {item.value}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-dark-900">
                <h3 className="text-xl font-bold mb-4 tracking-tight">
                  {t('actions.getQuote')}
                </h3>
                <p className="leading-relaxed">
                  {t('common.slogan')}
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </Section>
    </div>
  );
}
