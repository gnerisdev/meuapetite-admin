import { styled } from '@mui/system';
import { createTheme } from '@mui/material';


export const ThemeDark = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ee2737ff' },
    secondary: { main: '#ff7f32ff' },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
});