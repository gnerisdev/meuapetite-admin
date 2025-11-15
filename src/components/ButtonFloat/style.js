import { Button } from '@mui/material';
import { styled } from '@mui/material/styles'

export const ButtonCustom = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: '8px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'calc(100% - 32px)',
  maxWidth: '400px',
  minHeight: '48px',
  zIndex: theme.zIndex.drawer + 1,
  borderRadius: 8,
  textTransform: 'capitalize',
  '@media(max-width: 599px)': {
    bottom: '8px',
  },
}))