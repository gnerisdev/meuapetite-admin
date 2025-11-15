import { createContext, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ApiService } from 'services/api.service';
import { useServiceWorker } from 'hooks/useServiceWorker';

export const GlobalContext = createContext();

export const GlobalProvider = (props) => {
  const apiService = new ApiService();
  const [company, setCompany] = useState({});
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticationStatus, setAuthenticationStatus] = useState('authenticating');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  
  // Registrar Service Worker para PWA
  const { isSupported: swSupported } = useServiceWorker();

  const getComapny = async () => {
    try {
      const response = await apiService.get(`/admin/company`);
      const company = await response.data;

      setCompany(company);

      if (response.status === 401) return setAuthenticationStatus('unauthenticated');

      setAuthenticationStatus('authenticated');
    } catch (e) {
      setAuthenticationStatus('unauthenticated');
    }
  };

  const changeTheme = (theme) => {
    setThemeMode(theme);
    localStorage.setItem('theme', theme);
  };

  const getTheme = () => setThemeMode(localStorage.getItem('theme'));

  useEffect(() => {
    getComapny();
    getTheme();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        company,
        setCompany,
        token,
        setToken,
        loading,
        setLoading,
        toast,
        authenticationStatus,
        isMenuOpen,
        setIsMenuOpen,
        themeMode,
        changeTheme
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      {props.children}
    </GlobalContext.Provider>
  );
};
