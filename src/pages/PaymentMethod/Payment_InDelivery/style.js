import { styled } from '@mui/system';
import Button from '@mui/material/Button';

export const Title = styled('p')(({ theme }) => ({
  margin: '1.5rem 0 0',
  fontSize: theme.spacing(2.1),
  minWidth: theme.spacing(20)
}));

export const SubTitle = styled('h4')(({ theme }) => ({
  margin: 0,
  fontSize: theme.spacing(2),
  minWidth: theme.spacing(20)
}));

export const Wrapper = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const CategoryPayment = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  borderBottom: '1px solid #c6c6c6',
  padding: `${theme.spacing(3)} 0` 
}));

export const WrapperButtonSaved = styled('div')(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(2),
  'button': { width: '100%', maxWidth: '400px', minHeight: '48px'}
}));

export const ButtonSuport = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1), 
  width: '100%', 
  display: 'flex', 
  alignItems: 'center',
  gap: theme.spacing(1)
}));
