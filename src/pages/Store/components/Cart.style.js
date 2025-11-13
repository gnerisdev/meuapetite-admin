import { styled } from '@mui/system';
import { Box } from '@mui/material';

export const CartHeader = styled(Box)(({ $primaryColor }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: $primaryColor,
  color: '#fff',
}));

export const CartContent = styled(Box)({
  padding: '24px',
  height: 'calc(100vh - 64px)',
  overflowY: 'auto',
});

