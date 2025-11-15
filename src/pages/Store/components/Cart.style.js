import { styled } from '@mui/system';
import { Box } from '@mui/material';

export const CartHeader = styled(Box)(({ $primaryColor }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  backgroundColor: $primaryColor,
  color: '#fff',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

export const CartContent = styled(Box)({
  padding: '20px',
  height: 'calc(100vh - 80px)',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
});

