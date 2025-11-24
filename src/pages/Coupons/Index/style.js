import { Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';

export const ContainerCoupons = styled('main')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  marginTop: 32,
  padding: theme.spacing(0, 1),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 2),
  }
}));

export const CardCustom = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    '& .overlay-actions': {
      opacity: 1,
      visibility: 'visible',
    }
  }
}));

export const CardMediaWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '50%', // Aspect ratio menor para cupons
  overflow: 'hidden',
  backgroundColor: theme.palette.primary.main,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  }
}));

export const CouponCodeDisplay = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '2rem',
  fontWeight: 700,
  color: '#fff',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  letterSpacing: '0.1em',
  zIndex: 1,
}));

export const OverlayActions = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: 2,
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.3s ease',
  display: 'flex',
  gap: theme.spacing(0.5),
}));

export const StatusBadge = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  zIndex: 2,
}));

export const CardContentCustom = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `${theme.spacing(2)} !important`,
  paddingTop: `${theme.spacing(1.5)} !important`,
}));

export const EmptyState = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 2),
  textAlign: 'center',
  minHeight: '400px',
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.02)' 
    : 'rgba(0, 0, 0, 0.02)',
}));

