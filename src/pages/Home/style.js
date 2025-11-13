import { Card } from '@mui/material';
import { styled } from '@mui/system';

export const SectionChart = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  '@media(min-width: 992px)': {
    gap: '16px',
    gridTemplateColumns: '1fr 1fr',
  }
}));

export const StyledCard = styled(Card)(({ theme }) => ({ 
  maxWidth: '100%',
  width: '100%',
  marginBottom: '20px',
  boxShadow: theme.shadows[2],
  transition: 'transform 0.2s, box-shadow 0.2s',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: theme.shadows[4],
  }
}));

export const ChartContainer = styled('div')({ 
  width: '100%',
  maxWidth: '100%',
  position: 'relative',
  overflow: 'hidden',
  '& canvas': {
    maxWidth: '100% !important',
    height: 'auto !important'
  }
});

export const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  width: '100%',
  maxWidth: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  [theme.breakpoints.down('sm')]: {
    '&:hover': {
      transform: 'none',
    },
  },
}));