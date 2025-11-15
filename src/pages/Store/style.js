import { styled } from '@mui/system';
import { Card, CardContent } from '@mui/material';

export const StoreContainer = styled('div')({
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  paddingBottom: '100px',
});

export const StoreHeader = styled('div')({
  background: '#ffffff',
  padding: '24px 20px',
  borderBottom: '1px solid #e8e8e8',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
});

export const OpeningHours = styled('div')({
  marginTop: '24px',
  padding: '16px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
});

export const ProductsSection = styled('section')({
  padding: '24px 0',
  backgroundColor: '#ffffff',
});

export const ProductCard = styled(Card)(({ $primaryColor }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  backgroundColor: '#ffffff',
  '&:hover': {
    borderColor: '#e0e0e0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)',
    '& .product-image-bg': {
      transform: 'scale(1.08)',
    },
    '& .product-overlay': {
      opacity: 1,
    },
  },
}));

export const ProductImageContainer = styled('div')({
  width: '100%',
  paddingTop: '75%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#f8f8f8',
  borderRadius: '12px 12px 0 0',
  marginBottom: '0',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.01) 100%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
});

export const ProductOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.02) 100%)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  pointerEvents: 'none',
  zIndex: 2,
});

export const ProductCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: '16px !important',
  gap: '8px',
  '&.product-content': {},
});

