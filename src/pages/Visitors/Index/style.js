import { styled } from '@mui/system';

export const Container = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '100%',
  margin: '0 auto',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

