import { Button, Card, CardContent, CardMedia } from '@mui/material';
import { styled } from '@mui/system';

export const ContainerProducts = styled('main')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  marginTop: 32,
  padding: theme.spacing(0, 1),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 2),
  }
}));

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

export const CardCustom = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    '& .card-media-wrapper': {
      '&::after': {
        opacity: 1,
      }
    },
    '& .overlay-actions': {
      opacity: 1,
      visibility: 'visible',
    }
  }
}));

export const CardMediaWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '75%', // 4:3 aspect ratio
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[100],
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

export const CardMediaCustom = styled(CardMedia)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
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

export const WrapperActions = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingBottom: theme.spacing(2), 
  gap: theme.spacing(1),
  color: '#000',
  '.action': {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
    backgroundColor: '#3498db', 
    color: 'white', 
    borderRadius: '5px', 
    padding: '4px 8px', 
    fontSize: theme.spacing(1.8),
    transition: 'background-color 0.3s ease', 
    cursor: 'pointer',
    '&:nth-child(1)': {
      background: theme.palette.main,
    },
    '&:nth-child(2)': {
      background: theme.palette.error.main,
    },
    '&:nth-child(3)': {
      background: '#c6c6c6',
    },
    '&:hover': {
      filter: 'brightness(0.8)'
    },
  }
}));

export const SearchContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  marginBottom: '8px',

  input: {
    flex: 1,
    padding: '8px',
    marginRight: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },

  button: {
    padding: '8px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}));

export const FilterContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  marginBottom: '32px',

  select: {
    padding: '8px',
    marginRight: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },

  button: {
    padding: '8px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}));


export const CustomButton = styled(Button)({
  '&:hover': {
    backgroundColor: 'rgba(0, 123, 255, 0.8)'
  },
});

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