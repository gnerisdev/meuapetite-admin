import { styled } from '@mui/system';

export const WrapperButtonSaved = styled('div')(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(2),
  'button': { width: '100%', maxWidth: '400px', minHeight: '48px'},
}));
