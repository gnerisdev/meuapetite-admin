import { Card, CardContent, CardMedia, MenuItem, Paper } from '@mui/material';
import { styled } from '@mui/system';

export const ContainerProducts = styled('main')({
  display: 'flex',
  flexDirection: 'column',
  gap: 32
});

export const ModalContainer = styled('div')({
  background: 'rgba(113,113,113,.4)',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  minHeight: '100%',
  zIndex: 2,
});

export const ModalContent = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: 4,
  boxShadow: 24,
  padding: 4,
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  background: '#fff',
  '@media (min-width: 768px)': {
    height: '85%',
    maxHeight: '800px',
    maxWidth: '700px',
  },
});

export const CardCustom = styled(Card)({
  boxShadow: '-1px 1px 1px rgba(0, 0, 0, 0.09)',
});

export const CardMediaCustom = styled(CardMedia)({
  width: 100,
  height: 100,
  borderRadius: 6
});

export const CardContentCustom = styled(CardContent)({
  display: 'grid',
  gap: '16px',
  paddingBottom: '8px !important'
});

export const CardInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column'

});

export const Description = styled('p')({
  textOverflow: 'ellipsis',
  fontSize: '.9rem',
  lineHeight: '1.25rem',
  wordWrap: 'break-word',
  overflow: 'hidden',
  whiteSpace: 'pre-line',
  visibility: 'visible',
  display: '-webkit-box',
  '-webkit-line-clamp': '2',
  '-webkit-box-orient': 'vertical',
  color: '#717171',
  fontWeight: '300',
  '@media (min-width: 768px)': {
    fontSize: '.877rem',
    lineHeight: '1.25rem'
  },
});

export const WrapperAction = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px',
  marginLeft: '16px',  
  paddingTop: '8px'
}));

export const MenuItemCuston = styled(MenuItem)({
  display: 'flex',
  gap: 8
});

export const CustomPaper = styled(Paper)({
  padding: '20px', 
  margin: '20px auto',
  width: '100%',
  maxWidth: 800
});

export const ProductInfo = styled(Paper)({
  border: 'none', 
  borderBottom: '1px solid #ccc', 
  marginTop: 12,
  marginBottom: 12,
  display: 'grid', 
  gridTemplateColumns: '1fr 80px',
  justifyContent: 'space-between',
  'img': {
    width: 90,
    height: 90,
    borderRadius: 4,
    maxWidth: '100px',
    objectFit: 'cover'
  }
});
