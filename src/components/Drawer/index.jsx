import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  ListItemIcon,
  ListItemText,
  List,
  Toolbar,
  Box,
  IconButton,
  MenuList,
  MenuItem,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  Fade,
  Typography
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Avatar, CardHeader, styled } from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import { menuItems } from './items';
import * as S from './style';

const MiniDrawer = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [openMenuProfile, setOpenMenuProfile] = useState(false);
  const [openSettingsMenu, setOpenSettingsMenu] = useState(false);
  const [routeActive, setRouteActive] = useState('home');
  const [currentLeft, setCurrentLeft] = useState('home');
  const { company, setCompany, changeTheme, themeMode, toast } = useContext(GlobalContext);
  const apiService = new ApiService();

  const handleDrawerOpen = () => setOpen(true);

  const handleDrawerClose = () => {
    setOpen(false);
    setOpenSettingsMenu(false);
  };

  const toLink = (link) => {
    if (window.innerWidth <= 900) handleDrawerClose();
    setRouteActive(link);
    navigate(link);
    setOpenSettingsMenu(false);
  };

  const toggleoMenuProfile = () => setOpenMenuProfile(!openMenuProfile);
  const toggleSettingsMenu = () => setOpenSettingsMenu(!openSettingsMenu);

  const toggleStoreOnline = async (event) => {
    // Se o evento veio do Switch, usar o checked, senão inverter o estado atual
    const isOnline = event.target?.checked !== undefined 
      ? event.target.checked 
      : !company?.online;
    
    // Verificar se está tentando colocar online sem endereço preenchido
    if (isOnline && !company?.address?.zipCode) {
      toast.error('Você precisa preencher o endereço antes de colocar a loja online.');
      // Prevenir que o switch mude de estado
      if (event.target) {
        event.target.checked = false;
      }
      return;
    }
    
    try {
      const { data } = await apiService.put('/admin/company/online', { online: isOnline });
      setCompany({ ...company, online: isOnline });
      toast.success(isOnline ? 'Loja colocada online!' : 'Loja colocada offline!');
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Não foi possível atualizar o status da loja';
      toast.error(errorMessage);
      // Reverter o estado do switch em caso de erro
      if (event.target) {
        event.target.checked = !isOnline;
      }
    }
  };

  const menuItemsProfile = [
    {
      label: 'Visitar cardápio',
      iconClass: 'fa-eye',
      action: () => {
        const baseUrl = process.env.REACT_APP_MENU_BASE_URL || window.location.origin;
        window.open(`${baseUrl}/store/${company.storeUrl}`, '_blank');
        setOpenMenuProfile(false);
      }
    },
    {
      label: 'Termos de uso e privacidade',
      iconClass: 'fa-file-alt',
      action: () => {
        navigate('terms');
        setOpenMenuProfile(false);
      }
    },
    {
      label: 'Sair',
      iconClass: 'fa-sign-out-alt',
      action: () => {
        localStorage.removeItem('_id');
        localStorage.removeItem('token');
        return window.location.reload();
      }
    },
  ];

  const CustomCardHeader = styled(CardHeader)`&& .css-1ssile9-MuiCardHeader-avatar { margin: 0 }`;

  useEffect(() => {
    const handleResize = () => {
      const isWidthGreaterThan900 = window.innerWidth > 899;
      const appMain = document.querySelector('#app-main');
      const buttonFloat = document.querySelector('#button-float');
      console.log(isWidthGreaterThan900);

      if (buttonFloat && appMain && isWidthGreaterThan900 && open) {
        if (open) {
          buttonFloat.style.left = `calc(50% + ${((256 / window.innerWidth) * 100)}% - ${buttonFloat.clientWidth / 1.2}px)`;
          buttonFloat.style.transform = 'initial';
        } else {
          buttonFloat.style.transform = 'translateX(-50%)';
          buttonFloat.style.left = '50%';
        }
      } else if ((buttonFloat && appMain) && isWidthGreaterThan900 === false) {
        buttonFloat.style.transform = 'translateX(-50%)';
        buttonFloat.style.left = '50%';
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);


  useEffect(() => {
    const currentRoute = location.pathname.split('/');
    const route = '/' + currentRoute[1];
    setRouteActive(route);
    
    // Se não estiver em uma rota de configurações, fechar o dropdown
    const isConfigRoute = route === '/settings' || 
                         route === '/appearance' || 
                         route === '/payment-method' ||
                         route === '/opening-hours' ||
                         route.startsWith('/settings/') ||
                         route.startsWith('/payment-method/');
    
    if (!isConfigRoute) {
      setOpenSettingsMenu(false);
    }
  }, [location.pathname]);

  return (
    <S.Container>
      <CssBaseline />
      <S.AppBar open={open} position="fixed" sx={{ height: "65px" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 2, ...(open && { visibility: "hidden" }) }}
          >
            <MenuIcon />
          </IconButton>

          <S.WrapperIntro onClick={toggleoMenuProfile}>
            <CustomCardHeader
              sx={{ flexDirection: "row-reverse", gap: '8px', pr: 0, m: 0 }}
              avatar={<Avatar sx={{  m: 0 }} src={company.custom.logo?.url} />}
              title={company.fantasyName}
            />
            <span id="button-down" className="fas fa-angle-down"></span>
          </S.WrapperIntro>
        </Toolbar>

        {openMenuProfile &&
          <S.PaperMenuCustom>
            <MenuList>
              {menuItemsProfile.map((item, index) => (
                <MenuItem onClick={item.action} key={index} sx={{ gap: '8px', wordWrap: 'break-word' }}>
                  <span className={`fa ${item.iconClass}`} /> {item.label}
                </MenuItem>
              ))}
            </MenuList>
          </S.PaperMenuCustom>
        }
      </S.AppBar>

      <S.Drawer variant="permanent" open={open}>
        <S.DrawerHeader>
          <S.OnlineStatusWrapper>
            {open ? (
              <S.OnlineStatusCard online={company?.online || false}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <S.StatusIcon online={company?.online || false}>
                    {company?.online ? (
                      <StorefrontIcon sx={{ fontSize: '1.1rem' }} />
                    ) : (
                      <StoreIcon sx={{ fontSize: '1.1rem' }} />
                    )}
                  </S.StatusIcon>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        lineHeight: 1.2,
                        color: 'text.primary'
                      }}
                    >
                      {company?.online ? 'Loja Online' : 'Loja Offline'}
                    </Typography>
                  </Box>
                  <Switch
                    checked={company?.online || false}
                    onChange={toggleStoreOnline}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        '&.Mui-checked': {
                          color: '#4caf50',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </S.OnlineStatusCard>
            ) : (
              <Tooltip title={company?.online ? 'Loja Online' : 'Loja Offline'} arrow>
                <S.OnlineStatusCard online={company?.online || false} compact>
                  <S.StatusIcon online={company?.online || false}>
                    {company?.online ? (
                      <StorefrontIcon sx={{ fontSize: '1.1rem' }} />
                    ) : (
                      <StoreIcon sx={{ fontSize: '1.1rem' }} />
                    )}
                  </S.StatusIcon>
                </S.OnlineStatusCard>
              </Tooltip>
            )}
          </S.OnlineStatusWrapper>
          <IconButton 
            onClick={handleDrawerClose}
            sx={{ 
              flexShrink: 0,
              display: 'flex'
            }}
          >
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </S.DrawerHeader>

            <List sx={{ p: 0 }}>
          {menuItems.map((item, index) => {
            // Verificar se é o item de Configurações
            const isSettingsItem = item.link === '/settings';
            // Verificar se a rota atual é uma das rotas de configurações
            const isSettingsRoute = routeActive === '/settings' || 
                                   routeActive === '/appearance' || 
                                   routeActive === '/payment-method' ||
                                   routeActive.startsWith('/settings/') ||
                                   routeActive.startsWith('/payment-method/');
            
            return (
              <Box key={index}>
                <S.MenuItem
                  disablePadding
                  open={open} 
                  className={routeActive === item.link || (isSettingsItem && isSettingsRoute) ? 'active-item' : ''}
                  onClick={() => {
                    if (isSettingsItem) {
                      toggleSettingsMenu();
                    } else {
                      toLink(item.link);
                    }
                  }}
                >
                  <S.ListItemButtonCustom open={open}>
                    <ListItemIcon 
                      title={item.text} 
                      sx={{ justifyContent: 'center' }}
                    >
                      <item.Icon />
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                    {isSettingsItem && open && (
                      <span 
                        className={`fas fa-angle-${openSettingsMenu ? 'up' : 'down'}`}
                        style={{ marginLeft: 'auto', opacity: open ? 1 : 0 }}
                      />
                    )}
                  </S.ListItemButtonCustom>
                </S.MenuItem>
                
                {isSettingsItem && openSettingsMenu && open && (
                  <List sx={{ pl: 4 }}>
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/appearance' ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/appearance');
                        setOpenSettingsMenu(false);
                      }}
                    >
                      <S.ListItemButtonCustom open={open}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '40px' }}>
                          <i className="fas fa-paint-brush"></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary="Aparência" 
                          sx={{ opacity: open ? 1 : 0, '& .MuiListItemText-primary': { fontSize: '0.875rem' } }} 
                        />
                      </S.ListItemButtonCustom>
                    </S.MenuItem>
                    
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/payment-method' ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/payment-method');
                        setOpenSettingsMenu(false);
                      }}
                    >
                      <S.ListItemButtonCustom open={open}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '40px' }}>
                          <i className="fas fa-credit-card"></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary="Formas de pagamento" 
                          sx={{ opacity: open ? 1 : 0, '& .MuiListItemText-primary': { fontSize: '0.875rem' } }} 
                        />
                      </S.ListItemButtonCustom>
                    </S.MenuItem>
                    
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/settings/delivery' ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/settings/delivery');
                        setOpenSettingsMenu(false);
                      }}
                    >
                      <S.ListItemButtonCustom open={open}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '40px' }}>
                          <i className="fas fa-truck"></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary="Delivery" 
                          sx={{ opacity: open ? 1 : 0, '& .MuiListItemText-primary': { fontSize: '0.875rem' } }} 
                        />
                      </S.ListItemButtonCustom>
                    </S.MenuItem>
                    
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/settings/info' ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/settings/info');
                        setOpenSettingsMenu(false);
                      }}
                    >
                      <S.ListItemButtonCustom open={open}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '40px' }}>
                          <i className="fas fa-user-shield"></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary="Dados" 
                          sx={{ opacity: open ? 1 : 0, '& .MuiListItemText-primary': { fontSize: '0.875rem' } }} 
                        />
                      </S.ListItemButtonCustom>
                    </S.MenuItem>
            </List>
                )}
          </Box>
            );
          })}
        </List>
      </S.Drawer>
    </S.Container>
  );
};

export default MiniDrawer;
