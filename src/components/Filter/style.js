import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ContainerMain = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease-in-out',
  overflow: 'visible',
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

export const FilterContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(2),
  width: '100%',

  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2.5),
  },

  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(3),
  },

  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

export const ContainerButton = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(1.5),
  width: '100%',
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column-reverse',
    '& > *': {
      width: '100%',
    },
  },
}));