import { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Slide,
  IconButton
} from '@mui/material';
import {
  GetApp,
  CheckCircle,
  PhoneAndroid,
  DesktopWindows,
  Close
} from '@mui/icons-material';
import { usePWAInstall } from 'hooks/usePWAInstall';

const InstallPWAButton = () => {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    // Verificar se o usuário já fechou o banner antes
    return localStorage.getItem('pwa-install-dismissed') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    // Salvar preferência no localStorage
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installPWA();
    } catch (error) {
      console.error('Erro ao instalar:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Não mostrar se já estiver instalado, não for instalável ou foi fechado
  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  // Detectar dispositivo
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  return (
    <Slide direction="down" in={isInstallable} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 24 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          width: { xs: 'calc(100% - 32px)', sm: 'auto' },
          maxWidth: { xs: '100%', sm: 420 },
        }}
      >
        <Card
          elevation={8}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={handleDismiss}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
              },
              zIndex: 1,
            }}
            size="small"
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
          
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isMobile ? (
                  <PhoneAndroid sx={{ fontSize: 32, color: 'white' }} />
                ) : (
                  <DesktopWindows sx={{ fontSize: 32, color: 'white' }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    mb: 0.5,
                  }}
                >
                  Instalar App
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  Instale para receber notificações de pedidos com som
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleInstall}
              disabled={isInstalling}
              startIcon={
                isInstalling ? (
                  <CheckCircle sx={{ fontSize: 20 }} />
                ) : (
                  <GetApp sx={{ fontSize: 20 }} />
                )
              }
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                fontWeight: 700,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isInstalling ? 'Instalando...' : 'Instalar Agora'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Slide>
  );
};

export default InstallPWAButton;

