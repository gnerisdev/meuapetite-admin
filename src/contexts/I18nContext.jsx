import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from './Global';
import { ApiService } from 'services/api.service';

export const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const globalContext = useContext(GlobalContext);
  const company = globalContext?.company;
  const setCompany = globalContext?.setCompany;
  const { i18n } = useTranslation();
  const apiService = new ApiService();
  
  // Idiomas disponíveis
  const languages = [
    { code: 'pt-BR', name: 'Português (BR)' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
  ];

  // Obter idiomas do localStorage ou do company ou usar padrão
  const getAdminLanguage = () => {
    if (company?.settings?.adminLanguage) {
      return company.settings.adminLanguage;
    }
    return localStorage.getItem('adminLanguage') || 'pt-BR';
  };

  const getStoreLanguage = () => {
    if (company?.settings?.storeLanguage) {
      return company.settings.storeLanguage;
    }
    return localStorage.getItem('storeLanguage') || 'pt-BR';
  };

  const [adminLanguage, setAdminLanguageState] = useState(getAdminLanguage());
  const [storeLanguage, setStoreLanguageState] = useState(getStoreLanguage());

  // Atualizar idioma do admin
  const setAdminLanguage = async (lang) => {
    setAdminLanguageState(lang);
    localStorage.setItem('adminLanguage', lang);
    
    // Atualizar no backend se estiver autenticado
    if (company?._id && setCompany) {
      try {
        await apiService.put('/admin/company/settings/language', {
          adminLanguage: lang,
        });
        // Atualizar company no contexto
        setCompany({
          ...company,
          settings: {
            ...company.settings,
            adminLanguage: lang,
          },
        });
      } catch (error) {
        console.error('Erro ao atualizar idioma do painel:', error);
      }
    }
    
    // Mudar o idioma do i18n para o painel
    i18n.changeLanguage(lang);
    i18n.loadNamespaces('admin');
  };

  // Atualizar idioma da loja
  const setStoreLanguage = async (lang) => {
    setStoreLanguageState(lang);
    localStorage.setItem('storeLanguage', lang);
    
    // Atualizar no backend se estiver autenticado
    if (company?._id && setCompany) {
      try {
        await apiService.put('/admin/company/settings/language', {
          storeLanguage: lang,
        });
        // Atualizar company no contexto
        setCompany({
          ...company,
          settings: {
            ...company.settings,
            storeLanguage: lang,
          },
        });
      } catch (error) {
        console.error('Erro ao atualizar idioma da loja:', error);
      }
    }
  };

  // Sincronizar com company quando carregar
  useEffect(() => {
    if (company?.settings?.adminLanguage) {
      const lang = company.settings.adminLanguage;
      setAdminLanguageState(lang);
      localStorage.setItem('adminLanguage', lang);
      i18n.changeLanguage(lang);
    }
    
    if (company?.settings?.storeLanguage) {
      const lang = company.settings.storeLanguage;
      setStoreLanguageState(lang);
      localStorage.setItem('storeLanguage', lang);
    }
  }, [company?.settings?.adminLanguage, company?.settings?.storeLanguage, i18n]);

  // Função para obter tradução baseada no contexto (admin ou store)
  const getTranslation = (namespace, key, options = {}) => {
    const currentLang = namespace === 'store' ? storeLanguage : adminLanguage;
    return i18n.getFixedT(currentLang, namespace)(key, options);
  };

  return (
    <I18nContext.Provider
      value={{
        adminLanguage,
        storeLanguage,
        setAdminLanguage,
        setStoreLanguage,
        languages,
        getTranslation,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

