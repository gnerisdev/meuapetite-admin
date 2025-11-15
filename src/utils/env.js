// Helper para compatibilidade com variáveis de ambiente do Vite
// No Vite, variáveis de ambiente públicas devem começar com VITE_
// e são acessadas via import.meta.env

export const getEnv = (key) => {
  // Suporta tanto VITE_* quanto REACT_APP_* para compatibilidade
  const viteKey = key.startsWith('VITE_') ? key : `VITE_${key.replace('REACT_APP_', '')}`;
  const reactKey = key.startsWith('REACT_APP_') ? key : `REACT_APP_${key.replace('VITE_', '')}`;
  
  // Tenta VITE_ primeiro, depois REACT_APP_ para compatibilidade
  // No browser, process.env não existe, então usamos apenas import.meta.env
  return import.meta.env[viteKey] || import.meta.env[reactKey] || undefined;
};

// Helpers específicos para facilitar o uso
export const getApiUrl = () => getEnv('VITE_API_URL') || getEnv('REACT_APP_API_URL');
export const getApiBaseUrl = () => getEnv('VITE_API_BASE_URL') || getEnv('REACT_APP_API_BASE_URL');
export const getMenuBaseUrl = () => getEnv('VITE_MENU_BASE_URL') || getEnv('REACT_APP_MENU_BASE_URL');
export const getNodeEnv = () => import.meta.env.MODE || import.meta.env.NODE_ENV || 'development';

