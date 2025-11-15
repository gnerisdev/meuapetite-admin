import { Button, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const ButtonChangeLogo = styled(Button)(({ theme }) => ({
  backgroundColor: '#1976d2',
  color: '#ffffff',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#1565c0',
    color: '#ffffff',
  },
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  '&.Mui-selected': {
    backgroundColor: '#e0e0e0',
    color: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: '#eeeeee',
  },
}));