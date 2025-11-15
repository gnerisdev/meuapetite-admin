import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import adminPtBr from './locales/admin/pt-BR.json';
import adminFr from './locales/admin/fr.json';
import adminEs from './locales/admin/es.json';
import storePtBr from './locales/store/pt-BR.json';
import storeFr from './locales/store/fr.json';
import storeEs from './locales/store/es.json';

// Recuperar idiomas do localStorage ou usar padrão
const getAdminLanguage = () => {
  return localStorage.getItem('adminLanguage') || 'pt-BR';
};

const getStoreLanguage = () => {
  return localStorage.getItem('storeLanguage') || 'pt-BR';
};

// Configuração para o painel admin
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        admin: adminPtBr,
        store: storePtBr,
      },
      'fr': {
        admin: adminFr,
        store: storeFr,
      },
      'es': {
        admin: adminEs,
        store: storeEs,
      },
    },
    lng: getAdminLanguage(),
    fallbackLng: 'pt-BR',
    defaultNS: 'admin',
    ns: ['admin', 'store'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

