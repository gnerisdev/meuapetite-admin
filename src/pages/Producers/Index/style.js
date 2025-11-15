import { MenuItem } from '@mui/material';
import { styled } from '@mui/system';

export const ContainerProducers = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

export const ContainerProducer = styled('div')(({ theme }) => ({
  border: '1px solid #e0e1e0', 
}));

export const HeaderProducer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#f1f3f1',
  color: '#000000',
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  fontWeight: 'bold',
  '.actions': {
    display: 'flex',
    flexWrap: 'no-wrap',
    gap: theme.spacing(2),
    '.move': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    '.btnUp, .btnDown': {
      fontSize: theme.spacing(2.2),
      margin: `0 ${theme.spacing(0.5)}`,
      cursor: 'pointer',
      '&:hover': {
        opacity: 0.7
      }
    }
  },
}));

export const BodyProducer = styled('div')(({ theme }) => ({
  borderTop: '1px solid #e0e1e0', 
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`, 
  'p': {
    margin: 0,
    color: '#666',
    fontSize: theme.spacing(1.5)
  }
}));

export const MenuItemCuston = styled(MenuItem)({
  display: 'flex',
  gap: 8
});

