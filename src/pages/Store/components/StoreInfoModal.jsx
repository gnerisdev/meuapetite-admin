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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import * as S from './StoreInfoModal.style';

const StoreInfoModal = ({ open, onClose, store, primaryColor }) => {
  const formatOpeningHours = () => {
    if (!store?.settings?.openingHours) return [];
    
    const days = [
      { key: 'monday', label: 'Segunda-feira' },
      { key: 'tuesday', label: 'Terça-feira' },
      { key: 'wednesday', label: 'Quarta-feira' },
      { key: 'thursday', label: 'Quinta-feira' },
      { key: 'friday', label: 'Sexta-feira' },
      { key: 'saturday', label: 'Sábado' },
      { key: 'sunday', label: 'Domingo' },
    ];

    return days.map(day => {
      const hours = store.settings.openingHours[day.key];
      let text = '';
      
      if (hours.alwaysClosed) {
        text = 'Fechado';
      } else if (hours.alwaysOpen) {
        text = '24 horas';
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

  const address = formatAddress();
  const openingHours = formatOpeningHours();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: primaryColor,
        color: '#fff',
        padding: '20px 24px',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Informações da Loja
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px' }}>
        {/* Endereço */}
        {address && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocationOnIcon sx={{ color: primaryColor, fontSize: '1.5rem' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Endereço
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ pl: 4 }}>
              {address}
            </Typography>
          </Box>
        )}

        {address && <Divider sx={{ my: 3 }} />}

        {/* Horários de Funcionamento */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AccessTimeIcon sx={{ color: primaryColor, fontSize: '1.5rem' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Horários de Funcionamento
            </Typography>
          </Box>
          <Grid container spacing={1.5}>
            {openingHours.map((day, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  bgcolor: 'rgba(0,0,0,0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {day.label}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: day.text === 'Fechado' ? 'error.main' : 'text.primary'
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

