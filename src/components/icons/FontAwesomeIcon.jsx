import React from 'react';
import { Box } from '@mui/material';

/**
 * Componente para renderizar ícones Font Awesome via CDN
 * Usa diretamente as classes do Font Awesome que já está carregado no HTML
 * 
 * @param {string} icon - Nome do ícone Font Awesome (ex: 'home', 'user', 'bars')
 * @param {string} variant - Variante do ícone: 'solid', 'regular', 'light', 'brands' (padrão: 'solid')
 * @param {object} sx - Estilos do Material-UI
 * @param {string} className - Classes CSS adicionais
 * @param {object} props - Outras props do Box
 */
const FontAwesomeIcon = ({ 
  icon, 
  variant = 'solid', 
  sx = {}, 
  className = '',
  ...props 
}) => {
  // Mapear variant para prefixo Font Awesome
  const prefixMap = {
    solid: 'fas',
    regular: 'far',
    light: 'fal',
    brands: 'fab'
  };

  const prefix = prefixMap[variant] || 'fas';
  
  // Construir classe do Font Awesome (ex: 'fas fa-home')
  const iconClass = `${prefix} fa-${icon}`;

  return (
    <Box
      component="i"
      className={`${iconClass} ${className}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
      {...props}
    />
  );
};

export default FontAwesomeIcon;

