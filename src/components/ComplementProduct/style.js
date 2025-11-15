import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CardContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
  border: '1px solid #f0f0f0',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
    borderRadius: '8px',
  },
}));

export const OptionCard = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: '#fafafa',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '12px',
  border: '1px solid #f0f0f0',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px',
  },
}));

export const RadioOption = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: '12px',
  marginBottom: '8px',
  borderRadius: '8px',
  border: '1px solid #f0f0f0',
  backgroundColor: '#fafafa',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  '& .MuiFormControlLabel-root': {
    margin: 0,
    width: '100%',
  },
  '& .MuiRadio-root': {
    padding: '8px',
  },
}));

export const WrapperBtnNewGroup = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  marginTop: '16px',
}));

export const WrapperOption = styled('div')(({ theme }) => ({
  width: '100%',
  padding: '12px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  position: 'relative',
  backgroundColor: '#fafafa',
  [theme.breakpoints.up('sm')]: {
    padding: '16px',
  },
}));

export const ButtonRemoveOption = styled('div')(({ theme }) => ({
  // Mantido para compatibilidade
}));
