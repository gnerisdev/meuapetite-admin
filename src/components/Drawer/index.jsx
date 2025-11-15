import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { getMenuBaseUrl } from 'utils/env';
import CssBaseline from '@mui/material/CssBaseline';
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
import { MenuIcon, ChevronLeftIcon, ChevronRightIcon, StoreIcon, StorefrontIcon } from 'components/icons';
import { Avatar, CardHeader, styled } from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import { useTranslation } from 'react-i18next';
import { menuItems, useMenuItems } from './items';
import * as S from './style';

const MiniDrawer = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('admin');
  const menuItemsTranslated = useMenuItems();
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
    // Não fechar o menu de configurações se estiver navegando para outra página de configurações
    const isConfigLink = link === '/settings' || 
                         link === '/appearance' || 
                         link === '/payment-method' ||
                         link.startsWith('/settings/') ||
                         link.startsWith('/payment-method/');
    if (!isConfigLink) {
      setOpenSettingsMenu(false);
    }
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

    // Verificar se está tentando colocar online sem slug preenchido
    if (isOnline && !company?.storeUrl) {
      toast.error('Você precisa configurar o slug da loja antes de colocar a loja online.');
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
      label: t('menu.visitStore'),
      iconClass: 'fa-eye',
      action: () => {
        const baseUrl = getMenuBaseUrl() || window.location.origin;
        window.open(`${baseUrl}/store/${company.storeUrl}`, '_blank');
        setOpenMenuProfile(false);
      }
    },
    {
      label: t('menu.terms'),
      iconClass: 'fa-file-alt',
      action: () => {
        navigate('terms');
        setOpenMenuProfile(false);
      }
    },
    {
      label: t('menu.logout'),
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
    const adjustButtonPosition = () => {
      const isWidthGreaterThan900 = window.innerWidth > 899;
      const buttonFloat = document.querySelector('#button-float');
      const drawerWidth = 256; // Largura do drawer quando aberto

      if (buttonFloat) {
        if (isWidthGreaterThan900 && open) {
          // Quando o drawer está aberto, centralizar na área visível
          // O centro da área visível = drawerWidth + (largura total - drawerWidth) / 2
          const visibleAreaCenter = drawerWidth + (window.innerWidth - drawerWidth) / 2;
          buttonFloat.style.left = `${visibleAreaCenter}px`;
          buttonFloat.style.transform = 'translateX(-50%)';
        } else {
          // Quando o drawer está fechado ou em telas menores, centralizar normalmente
          buttonFloat.style.left = '50%';
          buttonFloat.style.transform = 'translateX(-50%)';
        }
      }
    };

    // Ajustar imediatamente
    adjustButtonPosition();

    // Verificar novamente após um pequeno delay para garantir que o botão foi montado
    const timeoutId = setTimeout(adjustButtonPosition, 100);
    
    // Verificar periodicamente se o botão foi montado (útil quando navega para uma nova página)
    const intervalId = setInterval(() => {
      const buttonFloat = document.querySelector('#button-float');
      if (buttonFloat) {
        adjustButtonPosition();
        clearInterval(intervalId); // Parar de verificar quando o botão for encontrado
      }
    }, 200);

    // Limpar após 2 segundos para não verificar indefinidamente
    const cleanupInterval = setTimeout(() => {
      clearInterval(intervalId);
    }, 2000);

    const handleResize = () => {
      adjustButtonPosition();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      clearTimeout(cleanupInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, location.pathname]);


  useEffect(() => {
    const currentRoute = location.pathname.split('/');
    const route = '/' + currentRoute[1];
    setRouteActive(route);
    
    // Verificar se está em uma rota de configurações
    const isConfigRoute = route === '/settings' || 
                         route === '/appearance' || 
                         route === '/payment-method' ||
                         route === '/opening-hours' ||
                         route.startsWith('/settings/') ||
                         route.startsWith('/payment-method/');
    
    // Se estiver em uma rota de configurações, manter o dropdown aberto
    if (isConfigRoute) {
      setOpenSettingsMenu(true);
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

        <Box sx={{ 
          flex: 1, 
          overflowY: 'hidden',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}>
          <List sx={{ 
            p: 0, 
            pt: 0.5,
            pb: 1,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            minHeight: 0,
          }}>
            {menuItemsTranslated.map((item, index) => {
            // Verificar se é o item de Configurações
            const isSettingsItem = item.link === '/settings';
            // Verificar se a rota atual é uma das rotas de configurações
            const isSettingsRoute = routeActive === '/settings' || 
                                   routeActive === '/appearance' || 
                                   routeActive === '/payment-method' ||
                                   routeActive === '/opening-hours' ||
                                   routeActive === '/settings/language' ||
                                   location.pathname === '/appearance' ||
                                   location.pathname.startsWith('/settings/') ||
                                   location.pathname.startsWith('/payment-method/');
            
            return (
              <Box key={index}>
                <S.MenuItem
                  disablePadding
                  open={open} 
                  className={routeActive === item.link || location.pathname === item.link || (isSettingsItem && isSettingsRoute) ? 'active-item' : ''}
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
                      sx={{ justifyContent: 'center', minWidth: '36px' }}
                    >
                      <item.Icon />
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                    {isSettingsItem && open && (
                      <span 
                        className={`fas fa-angle-${openSettingsMenu ? 'up' : 'down'}`}
                        style={{ marginLeft: 'auto', opacity: open ? 1 : 0, fontSize: '0.875rem' }}
                      />
                    )}
                  </S.ListItemButtonCustom>
                </S.MenuItem>
                
                {isSettingsItem && openSettingsMenu && open && (
                  <List sx={{ pl: 0, pt: 0, pb: 0, m: 0 }}>
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/appearance' || location.pathname === '/appearance' ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/appearance');
                      }}
                    >
                      <S.ListItemButtonCustom open={open} sx={{ pl: 4.5 }}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '36px' }}>
                          <i className="fas fa-paint-brush" style={{ fontSize: '1rem' }}></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('settings.appearance')} 
                          sx={{ opacity: open ? 1 : 0, '& .MuiListItemText-primary': { fontSize: '0.875rem' } }} 
                        />
                      </S.ListItemButtonCustom>
                    </S.MenuItem>
                    
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/payment-method' || location.pathname.startsWith('/payment-method') ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/payment-method');
                      }}
                    >
                      <S.ListItemButtonCustom open={open} sx={{ pl: 4.5 }}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '36px' }}>
                          <i className="fas fa-credit-card" style={{ fontSize: '1rem' }}></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('settings.payment')} 
                          sx={{ opacity: open ? 1 : 0, '& .MuiListItemText-primary': { fontSize: '0.875rem' } }} 
                        />
                      </S.ListItemButtonCustom>
                    </S.MenuItem>
                    
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/settings/delivery' || location.pathname === '/settings/delivery' ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/settings/delivery');
                      }}
                    >
                      <S.ListItemButtonCustom open={open} sx={{ pl: 4.5 }}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '36px' }}>
                          <i className="fas fa-motorcycle" style={{ fontSize: '1rem' }}></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('settings.delivery')} 
                          sx={{ opacity: open ? 1 : 0, '& .MuiListItemText-primary': { fontSize: '0.875rem' } }} 
                        />
                      </S.ListItemButtonCustom>
                    </S.MenuItem>
                    
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/settings/info' || location.pathname === '/settings/info' ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/settings/info');
                      }}
                    >
                      <S.ListItemButtonCustom open={open} sx={{ pl: 4.5 }}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '36px' }}>
                          <i className="fas fa-user-shield" style={{ fontSize: '1rem' }}></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('settings.info')} 
                          sx={{ opacity: open ? 1 : 0, '& .MuiListItemText-primary': { fontSize: '0.875rem' } }} 
                        />
                      </S.ListItemButtonCustom>
                    </S.MenuItem>
                    
                    <S.MenuItem
                      disablePadding
                      className={routeActive === '/settings/language' || location.pathname === '/settings/language' ? 'active-item' : ''}
                      onClick={() => {
                        toLink('/settings/language');
                      }}
                    >
                      <S.ListItemButtonCustom open={open} sx={{ pl: 4.5 }}>
                        <ListItemIcon sx={{ justifyContent: 'center', minWidth: '36px' }}>
                          <i className="fas fa-language" style={{ fontSize: '1rem' }}></i>
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('settings.language')} 
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
        </Box>
      </S.Drawer>
    </S.Container>
  );
};

export default MiniDrawer;
