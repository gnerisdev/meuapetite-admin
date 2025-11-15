import { styled } from '@mui/material/styles';
import { Button, ListItem, ListItemButton, Paper } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';


export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  [theme.breakpoints.down ('md')]: {
    position: 'absolute'
  }
}));

export const openedMixin = (theme) => ({
  width: 256,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  overflowY: 'hidden',
  zIndex: theme.zIndex.drawer + 2
});

export const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  '@media (max-width: 900px)': {
    display: 'none'
  },
});

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.25, 1),
  gap: theme.spacing(0.75),
  minHeight: '64px',
  flexShrink: 0,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 0.75),
    minHeight: '56px',
    gap: theme.spacing(0.5),
  },
  '.on': {
    display: 'flex',
    border: '2px solid #000000',
    borderRadius: 4,
    padding: '2px 12px',
    cursor: 'pointer'
  }
}));

export const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: 2,
  '@media (min-width: 900px)': { zIndex: theme.zIndex.drawer + 1 },
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  ...(open && {
    marginLeft: 256,
    '@media (min-width: 900px)': { width: `calc(100% - ${256}px)` },
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: 256,
  paddingTop: 0,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '.MuiDrawer-paperAnchorDockedLeft': {
    overflowY: 'hidden !important',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': {
      ...openedMixin(theme),
      overflowY: 'hidden !important',
      display: 'flex',
      flexDirection: 'column',
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': {
      ...closedMixin(theme),
      overflowY: 'hidden !important',
    },
  }),
}));

export const Logo = styled('img')(({ theme }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%'
}));

export const WrapperIntro = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textTransform: 'capitalize',
  '#button-down': {
    cursor: 'pointer'
  }
}));

export const MenuItem = styled(ListItem)(({ theme, open }) => ({
  display: 'block',
  padding: 0,
  marginBottom: theme.spacing(0.125),
  '&.active-item': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(25, 118, 210, 0.08)',
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    '[role="button"]': {
      marginLeft: '0',
      fontWeight: 600,
      color: theme.palette.primary.main,
    }
  },
  '&:hover:not(.active-item)': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.04)' 
      : 'rgba(0, 0, 0, 0.04)',
  },
  transition: 'all 0.2s ease-in-out',
}));

export const ButtonToggle = styled(Button)(({ theme, thememode }) => ({
  color: thememode === 'dark' ? '#fff' : '#092635',
  borderColor: thememode === 'dark' ? '#fff' : '#092635',
  display: 'flex',
  gap: '0.7rem',
  pl: '6px',
}));

export const ListItemButtonCustom = styled(ListItemButton)(({ theme, open }) => ({
  minHeight: 44,
  padding: theme.spacing(0.875, 1.25),
  justifyContent: open ? 'flex-start' : 'center', 
  marginLeft: 0,
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.125, 0.75),
  gap: theme.spacing(1.25),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.06)' 
      : 'rgba(0, 0, 0, 0.06)',
  },
  '& .MuiListItemIcon-root': {
    minWidth: open ? '36px' : 'auto',
    justifyContent: 'center',
    color: 'inherit',
    fontSize: '1.1rem',
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.01em',
    lineHeight: 1.4,
  },
}));

export const PaperMenuCustom = styled(Paper)(({ theme }) => ({
maxWidth: '250px', 
position: 'absolute', 
right: 0, 
top: '65px', 
}));

export const OnlineStatusWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
  width: '100%',
  maxWidth: 'calc(100% - 48px)',
  [theme.breakpoints.down('sm')]: {
    maxWidth: 'calc(100% - 40px)',
  },
}));

export const OnlineStatusCard = styled('div')(({ theme, online, compact }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: compact ? theme.spacing(0.75) : theme.spacing(0.75, 1.25),
  borderRadius: theme.spacing(1),
  backgroundColor: online 
    ? 'rgba(76, 175, 80, 0.12)' 
    : 'rgba(158, 158, 158, 0.12)',
  border: `1px solid ${online ? 'rgba(76, 175, 80, 0.3)' : 'rgba(158, 158, 158, 0.3)'}`,
  width: compact ? '40px' : '100%',
  minHeight: '40px',
  justifyContent: compact ? 'center' : 'flex-start',
  transition: 'all 0.2s ease',
  [theme.breakpoints.down('sm')]: {
    minHeight: '44px',
    padding: compact ? theme.spacing(0.75) : theme.spacing(0.75, 1),
  },
}));

export const StatusIcon = styled('div')(({ theme, online }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: online
    ? 'rgba(76, 175, 80, 0.2)'
    : 'rgba(158, 158, 158, 0.2)',
  color: online ? '#4caf50' : '#9e9e9e',
  flexShrink: 0,
  transition: 'all 0.2s ease',
  [theme.breakpoints.down('sm')]: {
    width: '24px',
    height: '24px',
  },
}));
