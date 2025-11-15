import { createTheme, styled, Grid } from "@mui/material";

export const ThemeDark = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ee2737ff' },
    secondary: { main: '#ff7f32ff' },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
});

export const GridCustom = styled(Grid)({
  backgroundRepeat: 'no-repeat',
  backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
  backgroundSize: 'cover',
  backgroundPosition: 'center',
})