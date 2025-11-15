import { useState, useEffect } from 'react';

// Tema simples para substituir o MUI theme
export const useTheme = () => {
  return {
    direction: 'ltr',
    palette: {
      primary: { main: '#1976d2', dark: '#1565c0', light: '#42a5f5' },
      secondary: { main: '#dc004e', dark: '#c51162', light: '#e91e63' },
      success: { main: '#2e7d32', dark: '#1b5e20', light: '#4caf50' },
      error: { main: '#d32f2f', dark: '#c62828', light: '#ef5350' },
      warning: { main: '#ed6c02', dark: '#e65100', light: '#ff9800' },
      info: { main: '#0288d1', dark: '#01579b', light: '#03a9f4' },
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
      down: (breakpoint) => {
        const values = {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
          xl: 1536,
        };
        return `(max-width: ${values[breakpoint] - 1}px)`;
      },
      up: (breakpoint) => {
        const values = {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
          xl: 1536,
        };
        return `(min-width: ${values[breakpoint]}px)`;
      },
    },
  };
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = typeof query === 'string' ? query : query.replace('@media ', '');
    const media = window.matchMedia(mediaQuery);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export const ThemeProvider = ({ children, theme }) => {
  return children;
};

