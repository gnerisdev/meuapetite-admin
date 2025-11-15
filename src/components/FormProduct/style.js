import { Select } from '@mui/material';
import { styled } from '@mui/system';

export const ImageProduct = styled('img')({
  width: '100%',
  height: '190px',
  objectFit: 'cover',
  border: '1px solid #c6c6c6',
  borderRadius: '8px'
});

export const wrapperIntro = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  paddingLeft: '1rem',
  gap: '1rem',
  width: '100%',
  alignItems: 'end',
  '@media(min-width: 576px)': {
    gridTemplateColumns: 'minmax(200px, 3fr) 9fr',
    marginBottom: '10px'    
  },
});

export const WrapperUpload = styled('div')(({ theme }) => ({
  position: 'relative',
  'button': {
    position: 'absolute',
    bottom: 10,
    height: '35px',
    width: '90%',
    left: '50%',
    transform: 'translateX(-50%)', 
    background: 'transparent',
    textTransform: 'uppercase'
  },
  'input': {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0
  },
  '.close': {
    position: 'absolute',
    width: '24px',
    height: '24px',
    background: theme.palette.primary.main,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    right: '-8px',
    top: '-8px',
    color: '#fff',
    cursor: 'pointer'
  },
  marginBottom: -4
}));

export const SelectCustom = styled(Select)(({ theme }) => ({
  width: '100%',
}));