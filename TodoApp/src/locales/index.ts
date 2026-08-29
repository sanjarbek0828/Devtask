import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ru from './ru.json';
import uz from './uz.json';
import { useAppStore } from '../store';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uz: { translation: uz }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language, will be overridden by Zustand persist
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
