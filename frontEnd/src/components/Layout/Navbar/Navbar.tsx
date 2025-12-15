import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestartTour } from '../../Common/OnboardingTour';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const restartTour = useRestartTour();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isRTL = i18n.language === 'he';

  return (
    <nav data-tour="navbar" className="sticky top-0 z-50 bg-slate-900 text-slate-100 h-14 shadow-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Section: Brand */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/courses')}
              className="text-lg font-bold text-white hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1"
              aria-label="Go to home"
            >
              Mini LMS Admin
            </button>
          </div>

          {/* Center Section: Navigation Links */}
          <ul className="flex items-center gap-6 rtl:flex-row-reverse">
            <li>
              <NavLink
                to="/courses"
                data-tour="nav-students"
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    isActive
                      ? 'text-white font-semibold bg-slate-800 border-b-2 border-indigo-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                {t('nav.courses')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/enrolments"
                data-tour="enrolments-link"
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    isActive
                      ? 'text-white font-semibold bg-slate-800 border-b-2 border-indigo-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                {t('nav.enrolments')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/report"
                data-tour="nav-reports"
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    isActive
                      ? 'text-white font-semibold bg-slate-800 border-b-2 border-indigo-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                {t('nav.report')}
              </NavLink>
            </li>
          </ul>

          {/* Right Section: Tour & Language Switcher */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* Tour Button with Icon and Text */}
            <button
              onClick={restartTour}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/30 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label={t('tour.buttons.help')}
              title={t('tour.buttons.help')}
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-slate-300">{t('tour.buttons.help')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              data-tour="language-switcher"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Switch language"
              title={isRTL ? 'Switch to English' : 'עבור לעברית'}
            >
              <span className={`transition-colors ${isRTL ? 'text-slate-400' : 'text-white font-semibold'}`}>
                EN
              </span>
              <span className="text-slate-600">|</span>
              <span className={`transition-colors ${isRTL ? 'text-white font-semibold' : 'text-slate-400'}`}>
                עב
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
