import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ar from './locales/ar.json';
import he from './locales/he.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  he: { translation: he },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he',
    fallbackLng: 'he',
    supportedLngs: ['ar', 'en', 'he'],
    keySeparator: '.',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Set document direction based on language (RTL for Arabic and Hebrew)
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'ar' || lng === 'he';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
const currentLng = i18n.language || 'he';
const isRTL = currentLng === 'ar' || currentLng === 'he';
document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
document.documentElement.lang = currentLng;

export default i18n;
