import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/services', label: t('nav.services') },
    { path: '/projects', label: t('nav.projects') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'he', name: 'עברית' },
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLangMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'bg-white border-b',
        scrolled 
          ? 'border-dark-200 shadow-premium-md' 
          : 'border-dark-100'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-premium flex items-center justify-center shadow-premium">
              <span className="text-dark-900 font-bold text-xl">SJ</span>
            </div>
            <span className="font-bold text-lg text-dark-900 transition-colors hidden md:block">
              {t('common.companyNameShort')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200 relative',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  isActive(link.path)
                    ? 'text-dark-900 font-semibold'
                    : 'text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                )}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                    layoutId="activeNav"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Language Switcher & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change language"
                aria-expanded={langMenuOpen}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-dark-600 hover:text-dark-900 hover:bg-dark-50"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase hidden sm:block">
                  {i18n.language}
                </span>
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 bg-white rounded-premium-lg shadow-premium-xl overflow-hidden min-w-[160px] border border-dark-100"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={clsx(
                          'block w-full text-left px-4 py-3 transition-colors',
                          i18n.language === lang.code
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-dark-700 hover:bg-dark-50'
                        )}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2 rounded-lg transition-all duration-200 text-dark-900 hover:bg-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-dark-100 bg-white"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'block px-4 py-3 rounded-lg font-medium transition-all duration-200',
                      isActive(link.path)
                        ? 'bg-primary-50 text-primary-700 font-semibold border-r-4 border-primary-500'
                        : 'text-dark-700 hover:bg-dark-50 hover:text-dark-900'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
