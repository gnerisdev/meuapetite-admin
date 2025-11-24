import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import { KeyboardArrowDownIcon } from 'components/icons';
import { useTranslation } from 'react-i18next';
import { useI18n } from 'contexts/I18nContext';

const LanguageSelector = ({ forStore = false }) => {
  const { t, i18n } = useTranslation(forStore ? 'store' : 'admin');
  const { languages, setStoreLanguage, storeLanguage, adminLanguage, setAdminLanguage } = useI18n();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Mapeamento de bandeiras para cada idioma
  const flagMap = {
    'pt-BR': '🇧🇷',
    'fr': '🇫🇷',
    'es': '🇪🇸',
  };

  // Obter idioma atual da loja (preferência do usuário ou padrão do admin)
  const getStoreCurrentLanguage = () => {
    if (forStore) {
      const userLanguage = localStorage.getItem('storeUserLanguage');
      return userLanguage || storeLanguage || 'pt-BR';
    }
    return adminLanguage;
  };

  const currentLanguage = getStoreCurrentLanguage();
  const currentLanguageName = languages.find(lang => lang.code === currentLanguage)?.name || currentLanguage;
  const currentFlag = flagMap[currentLanguage] || '🌐';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (langCode) => {
    if (forStore) {
      // Para a loja, salvar no localStorage com chave específica (preferência do usuário)
      localStorage.setItem('storeUserLanguage', langCode);
      // Disparar evento customizado para atualizar outros componentes na mesma aba
      const event = new Event('storeLanguageChanged');
      event.language = langCode;
      window.dispatchEvent(event);
      // Atualizar i18n imediatamente
      i18n.changeLanguage(langCode);
      i18n.loadNamespaces('store');
    } else {
      // Para o painel, usar a função do contexto que salva no backend
      await setAdminLanguage(langCode);
    }
    handleClose();
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        sx={{
          bgcolor: forStore ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          color: forStore ? '#333333' : 'inherit',
          padding: forStore ? '4px 12px' : { xs: '8px', sm: '10px' },
          height: forStore ? '32px' : 'auto',
          minWidth: forStore ? 'auto' : 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          borderRadius: forStore ? '16px' : '50%',
          backdropFilter: forStore ? 'blur(10px)' : 'none',
          boxShadow: forStore ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
          '&:hover': {
            bgcolor: forStore ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.04)',
            transform: forStore ? 'scale(1.05)' : 'none',
            boxShadow: forStore ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
          },
          transition: 'all 0.2s ease',
        }}
        aria-label="Selecionar idioma"
        title={forStore ? t('common.selectLanguage') : 'Selecionar idioma'}
      >
        <Box component="span" sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
          {currentFlag}
        </Box>
        <KeyboardArrowDownIcon sx={{ fontSize: '0.875rem' }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={currentLanguage === lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            sx={{
              minWidth: '180px',
              gap: 1.5,
            }}
          >
            <Box component="span" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
              {flagMap[lang.code] || '🌐'}
            </Box>
            <ListItemText
              primary={lang.name}
              secondary={currentLanguage === lang.code ? t('common.selected') || 'Selecionado' : ''}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;

