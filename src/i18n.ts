import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { Language } from './contexts/DataContext';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    
    // Language detection configuration
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Backend configuration for loading translations
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Default namespace
    defaultNS: 'common',
    ns: ['common'],
    
    // React i18next special options
    react: {
      useSuspense: true,
    },
  });

// Helper function to convert DataContext Language type to i18next language code
export const convertLanguageTypeToCode = (lang: Language): string => {
  return lang === 'EN' ? 'en' : 'ar';
};

// Helper function to convert i18next language code to DataContext Language type
export const convertLanguageCodeToType = (code: string): Language => {
  return code === 'en' ? 'EN' : 'AR';
};

export default i18n; 