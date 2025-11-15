import { Button } from '@mui/material';
import { styled } from '@mui/material/styles'

export const ButtonCustom = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%', 
  minHeight: '48px',
  zIndex: theme.zIndex.drawer + 1,
  borderStartEndRadius: 8,
  borderStartStartRadius: 8,
  borderEndStartRadius: 0,
  borderEndEndRadius: 0,
  '@media(min-width: 600px)': {
    left: '50%',  
    bottom: '8px',
    borderEndStartRadius: 8,
    borderEndEndRadius: 8,
    transform: 'translateX(-50%)',
    textTransform: 'capitalize',
    maxWidth: '400px', 
  },
}))