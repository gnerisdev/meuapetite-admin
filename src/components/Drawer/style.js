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
  width: 240,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
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
  padding: theme.spacing(0, 1),
  paddingLeft: '1.25rem',
  gap: theme.spacing(1),
  ...theme.mixins.toolbar,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 0.5),
    paddingLeft: theme.spacing(0.75),
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
  ...(open && {
    marginLeft: 240,
    '@media (min-width: 900px)': { width: `calc(100% - ${240}px)` },
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: 240,
  paddingTop: 0,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '.MuiDrawer-paperAnchorDockedLeft': {
    '::-webkit-scrollbar': {
      width: '5px'
    },              
    '::-webkit-scrollbar-track': {
      background: '#f1f1f1' 
    },               
    '::-webkit-scrollbar-thumb': {
      background: '#888'
    },              
    '::-webkit-scrollbar-thumb:hover': {
      background:'#555' 
    },
  },
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
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
  '&.active-item': {
    background: 'rgba(0, 0, 0, 0.04)',
    borderLeft: `4px solid ${theme.palette.secondary.main}`,
    '[role="button"]': {
      marginLeft: open ? '-18px' : '-6' 
    }
  }
}));

export const ButtonToggle = styled(Button)(({ theme, thememode }) => ({
  color: thememode === 'dark' ? '#fff' : '#092635',
  borderColor: thememode === 'dark' ? '#fff' : '#092635',
  display: 'flex',
  gap: '0.7rem',
  pl: '6px',
}));

export const ListItemButtonCustom = styled(ListItemButton)(({ theme, open }) => ({
  minHeight: 48,
  justifyContent: open ? 'initial' : 'center', 
  marginLeft: open ? -16 : 0
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
