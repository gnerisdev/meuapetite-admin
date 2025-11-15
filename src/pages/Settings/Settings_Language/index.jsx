import React, { useContext, useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Card, 
  CardActionArea,
  Chip,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useI18n } from 'contexts/I18nContext';
import { GlobalContext } from 'contexts/Global';
import { CheckCircleIcon } from 'components/icons';

const Settings_Language = () => {
  const { t } = useTranslation('admin');
  const { adminLanguage, storeLanguage, setAdminLanguage, setStoreLanguage, languages } = useI18n();
  const { toast } = useContext(GlobalContext);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [loadingStore, setLoadingStore] = useState(false);

  const getLanguageInfo = (code) => {
    const info = {
      'pt-BR': {
        flag: '🇧🇷',
        name: 'Português (BR)',
        nativeName: 'Português Brasileiro',
      },
      'fr': {
        flag: '🇫🇷',
        name: 'Français',
        nativeName: 'Français',
      },
      'es': {
        flag: '🇪🇸',
        name: 'Español',
        nativeName: 'Español',
      }
    };
    return info[code] || { flag: '🌐', name: code, nativeName: code };
  };

  const handleAdminLanguageChange = async (langCode) => {
    if (langCode === adminLanguage || loadingAdmin) return;
    
    setLoadingAdmin(true);
    try {
      await setAdminLanguage(langCode);
      toast.success(t('settings.languageUpdated'));
    } catch (error) {
      toast.error(t('settings.languageUpdateError') || t('common.error'));
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleStoreLanguageChange = async (langCode) => {
    if (langCode === storeLanguage || loadingStore) return;
    
    setLoadingStore(true);
    try {
      await setStoreLanguage(langCode);
      toast.success(t('settings.languageUpdated'));
    } catch (error) {
      toast.error(t('settings.languageUpdateError') || t('common.error'));
    } finally {
      setLoadingStore(false);
    }
  };

  const LanguageCard = ({ lang, selected, onClick, loading, type }) => {
    const info = getLanguageInfo(lang.code);
    const isSelected = selected === lang.code;

    return (
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
            borderColor: 'primary.main',
          },
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
          <CardActionArea
            onClick={() => !loading && onClick(lang.code)}
            disabled={loading}
            sx={{
              height: '100%',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 160,
            }}
          >
            {isSelected && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ color: 'white', fontSize: 18 }} />
              </Box>
            )}

            <Box
              sx={{
                fontSize: 56,
                mb: 1.5,
                transition: 'transform 0.2s ease',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {info.flag}
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                color: isSelected ? 'primary.main' : 'text.primary',
              }}
            >
              {lang.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.875rem',
                mb: 1.5,
              }}
            >
              {info.nativeName}
            </Typography>

            {isSelected && (
              <Chip
                label={t('common.selected') || 'Selecionado'}
                size="small"
                color="primary"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: 22,
                }}
              />
            )}
          </CardActionArea>
        </Card>
    );
  };

  return (
    <Box component="section" sx={{ pb: 4 }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mb: 1, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <i className="fas fa-language" style={{ fontSize: '1.5rem' }}></i>
        {t('settings.language')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {t('settings.configureLanguage')}
      </Typography>

      <Grid container spacing={3}>
        {/* Idioma do Painel Admin */}
        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1.5,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fas fa-user-shield" style={{ fontSize: '1.25rem', color: '#666' }}></i>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {t('settings.adminLanguage')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('settings.selectLanguageDescription')}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              {languages.map((lang) => (
                <Grid item xs={12} sm={6} md={4} key={lang.code}>
                  <LanguageCard
                    lang={lang}
                    selected={adminLanguage}
                    onClick={handleAdminLanguageChange}
                    loading={loadingAdmin}
                    type="admin"
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Idioma da Loja */}
        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1.5,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fas fa-store" style={{ fontSize: '1.25rem', color: '#666' }}></i>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {t('settings.storeLanguage')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('settings.selectStoreLanguageDescription')}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              {languages.map((lang) => (
                <Grid item xs={12} sm={6} md={4} key={lang.code}>
                  <LanguageCard
                    lang={lang}
                    selected={storeLanguage}
                    onClick={handleStoreLanguageChange}
                    loading={loadingStore}
                    type="store"
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Informação adicional */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <i className="fas fa-info-circle" style={{ fontSize: '1.25rem', color: '#666', marginTop: '2px' }}></i>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {t('settings.languageInfoTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('settings.languageInfoDescription')}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings_Language;
