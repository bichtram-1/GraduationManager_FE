// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { STORAGES } from '../constants/storage';
import { getCookie } from '../utils/cookie';
import ViTranslation from './languages/vi';

const language = getCookie(STORAGES.LANGUAGE);

const resources = {
  vi: {
    translation: ViTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: language, // ngôn ngữ mặc định
    fallbackLng: 'vi', // ngôn ngữ dự phòng nếu key không có trong ngôn ngữ hiện tại
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
