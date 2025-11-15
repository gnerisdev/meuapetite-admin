import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import { LanguageIcon } from 'components/icons';
import { useTranslation } from 'react-i18next';
import { useI18n } from 'contexts/I18nContext';

const LanguageSelector = ({ forStore = false }) => {
  const { t, i18n } = useTranslation(forStore ? 'store' : 'admin');
  const { languages, setStoreLanguage, storeLanguage, adminLanguage, setAdminLanguage } = useI18n();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
          color: 'inherit',
          padding: '8px',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
        aria-label="Selecionar idioma"
        title={forStore ? t('common.selectLanguage') : 'Selecionar idioma'}
      >
        <LanguageIcon />
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
              minWidth: '150px',
            }}
          >
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

