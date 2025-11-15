import { styled } from '@mui/system';

export const Wrapper = styled('div')({
  'div': {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'inline-block',
    margin: '0.5rem',
    animation: 'loading 2.5s ease-in-out infinite',
  },
  '@keyframes loading': {
    '0%, 100%': {
      transform: 'scale(0.2)',
      backgroundColor: '#0ddcf8',
    },
    '42%': {
      backgroundColor: '#5d4da6',
    },
    '50%': {
      transform: 'scale(1)',
      backgroundColor: '#42b58fb8',
    },
  },
  '.one': {
    animationDelay: '0s',
  },
  '.two': {
    animationDelay: '0.2s',
  },
  '.three': {
    animationDelay: '0.4s',
  },
  '.four': {
    animationDelay: '0.6s',
  },
  '.five': {
    animationDelay: '0.8s',
  },
});
