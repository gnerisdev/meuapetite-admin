import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Grid,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { OpenInNewIcon } from 'components/icons';
import { CloseIcon, LocationOnIcon, AccessTimeIcon, WhatsAppIcon } from 'components/icons';
import { useTranslation } from 'react-i18next';
import * as S from './StoreInfoModal.style';

const StoreInfoModal = ({ open, onClose, store, primaryColor }) => {
  const { t } = useTranslation('store');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatOpeningHours = () => {
    if (!store?.settings?.openingHours) return [];
    
    const days = [
      { key: 'monday', label: t('store.mondayFull') },
      { key: 'tuesday', label: t('store.tuesdayFull') },
      { key: 'wednesday', label: t('store.wednesdayFull') },
      { key: 'thursday', label: t('store.thursdayFull') },
      { key: 'friday', label: t('store.fridayFull') },
      { key: 'saturday', label: t('store.saturdayFull') },
      { key: 'sunday', label: t('store.sundayFull') },
    ];

    return days.map(day => {
      const hours = store.settings.openingHours[day.key];
      let text = '';
      
      if (hours.alwaysClosed) {
        text = t('store.closed');
      } else if (hours.alwaysOpen) {
        text = t('store.open24h');
      } else {
        text = `${hours.open} - ${hours.close}`;
      }
      
      return { ...day, text };
    });
  };

  const formatAddress = () => {
    if (!store?.address) return null;
    
    const { street, number, district, city, state, zipCode, freeformAddress } = store.address;
    
    if (freeformAddress) {
      return freeformAddress;
    }
    
    const parts = [];
    if (street || number) {
      parts.push(`${street || ''}${number ? `, ${number}` : ''}`.trim());
    }
    if (district) parts.push(district);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (zipCode) parts.push(zipCode);
    
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const getGoogleMapsUrl = () => {
    if (!store?.address) return null;
    const address = formatAddress();
    if (!address) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getWazeUrl = () => {
    if (!store?.address) return null;
    const address = formatAddress();
    if (!address) return null;
    return `https://waze.com/ul?q=${encodeURIComponent(address)}`;
  };

  const address = formatAddress();
  const openingHours = formatOpeningHours();
  const googleMapsUrl = getGoogleMapsUrl();
  const wazeUrl = getWazeUrl();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '16px' },
          maxHeight: { xs: '100vh', sm: '90vh' },
          margin: { xs: 0, sm: '32px' },
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: primaryColor,
        color: '#fff',
        padding: { xs: '16px 20px', sm: '20px 24px' },
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {t('store.storeInfo')}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: { xs: '20px', sm: '32px' }, maxHeight: { xs: 'calc(100vh - 80px)', sm: 'calc(90vh - 80px)' }, overflowY: 'auto' }}>
        {/* WhatsApp */}
        {store.whatsapp && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ 
                bgcolor: '#25D366', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <WhatsAppIcon sx={{ color: '#fff', fontSize: '1.75rem' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  {t('store.whatsapp')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('store.contactUs')}
                </Typography>
              </Box>
            </Box>
            <Button
              component="a"
              href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<WhatsAppIcon />}
              sx={{
                bgcolor: '#25D366',
                color: '#fff',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                '&:hover': {
                  bgcolor: '#20BA5A',
                  boxShadow: '0 6px 16px rgba(37, 211, 102, 0.4)',
                },
              }}
            >
              {store.whatsapp}
            </Button>
          </Box>
        )}

        {store.whatsapp && <Divider sx={{ my: 4 }} />}

        {/* Endereço */}
        {address && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ 
                bgcolor: primaryColor, 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <LocationOnIcon sx={{ color: '#fff', fontSize: '1.75rem' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  {t('store.address')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('store.howToGet')}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, pl: 7.5, fontSize: '1.1rem' }}>
              {address}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pl: 7.5 }}>
              {googleMapsUrl && (
                <Button
                  component="a"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<LocationOnIcon />}
                  sx={{
                    borderColor: '#4285F4',
                    color: '#4285F4',
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    padding: '10px 20px',
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: '#4285F4',
                      bgcolor: 'rgba(66, 133, 244, 0.08)',
                    },
                  }}
                >
                  {t('store.googleMaps')}
                </Button>
              )}
              {wazeUrl && (
                <Button
                  component="a"
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<LocationOnIcon />}
                  sx={{
                    borderColor: '#33CCFF',
                    color: '#33CCFF',
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    padding: '10px 20px',
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: '#33CCFF',
                      bgcolor: 'rgba(51, 204, 255, 0.08)',
                    },
                  }}
                >
                  Waze
                </Button>
              )}
            </Box>
          </Box>
        )}

        {address && <Divider sx={{ my: 4 }} />}

        {/* Horários de Funcionamento */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ 
              bgcolor: primaryColor, 
              borderRadius: '50%', 
              width: 48, 
              height: 48, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <AccessTimeIcon sx={{ color: '#fff', fontSize: '1.75rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                {t('store.openingHoursTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('store.today')}
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={1.5}>
            {openingHours.map((day, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  bgcolor: 'rgba(0,0,0,0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.04)',
                    transform: 'translateX(4px)',
                  },
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem' }}>
                    {day.label}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: day.text === t('store.closed') ? 'error.main' : 'text.primary'
                    }}
                  >
                    {day.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default StoreInfoModal;

