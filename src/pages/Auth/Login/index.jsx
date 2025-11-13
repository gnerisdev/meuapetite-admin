import { useContext, useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Avatar,
  Button,
  CssBaseline,
  ThemeProvider,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
} from '@mui/material';
import ImageIntro from 'assets/images/intro-login.webp';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import BackdropLoading from 'components/BackdropLoading';
import * as S from './style';


export default function Login() {
  const apiService = new ApiService(false);
  const { toast } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ email: '', password: '' });

  const checkSuport = () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    return true;
  };

  const urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const registerServiceWorker = async () => {
    const registration = await navigator.serviceWorker.register('sw.js');
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) await existingSubscription.unsubscribe();

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(
        'BIKAYUcYP8q6CbBFRfBJsOz9zJcl8siDpqr7vAu5I1Y8q5M0bW2UGpimc4lwzEVD4VlpUzeZ7HRyNjh6J7xOOQI'
      ),
    });

    return newSubscription;
  };

  const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();

    if (permission !== 'granted') return false 
    return true;
  };

  const handleSubmit = async (e) => {
    try {
      setLoading('Aguarde...');
      e.preventDefault();
      let subscription = null;

      if (!data.email) return toast.error('O Email não pode ficar em branco');
      if (!data.password) return toast.error('A Senha não pode ficar em branco');

      if (checkSuport()) {
        const isPermission = await requestNotificationPermission();
        if (!isPermission) {
          toast.error('Por favor, conceda permissão de notificação para o funcionamento adequado do sistema.');
        } else {
          subscription = await registerServiceWorker() || null;
        }
      }

      const response = await apiService.post('/auth/login', { ...data, subscription });

      if (!response || !response.data) {
        return toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      }

      if (!response.data.success) {
        return toast.error(response.data.message || 'Erro ao fazer login. Tente novamente.');
      }

      if (!response.data._id || !response.data.token) {
        return toast.error('Dados de autenticação inválidos. Tente novamente.');
      }

      localStorage.setItem('_id', JSON.stringify(response.data._id));
      localStorage.setItem('token', JSON.stringify(response.data.token));

      if (!checkSuport()) {
        toast(
          'Seu navegador não suporta notificações em tempo real.'
          + 'Use o Google Chrome para acessar todas as funcionalidades do sistema.',
          { icon: "⚠️" }
        );

        setTimeout(() => document.location.href = '/home', 5000);
      } else {
        return document.location.href = '/home';
      }
    } catch (e) {
      let errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      
      // Tratamento específico para diferentes tipos de erro de rede
      if (e?.code === 'ECONNABORTED' || e?.message?.includes('timeout')) {
        errorMessage = 'Tempo de conexão esgotado. Verifique sua internet e tente novamente.';
      } else if (e?.code === 'ERR_NETWORK' || e?.message?.includes('Network Error')) {
        errorMessage = 'Erro de rede. Verifique se o servidor está acessível e sua conexão está ativa.';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      } else if (e?.response?.status) {
        if (e.response.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        } else {
          errorMessage = `Erro ${e.response.status}. Tente novamente.`;
        }
      }
      
      return toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={S.ThemeDark}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />

        <S.GridCustom
          item xs={false} sm={4} md={7} sx={{ backgroundImage: `url(${ImageIntro})` }} />

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockOutlinedIcon /></Avatar>

            <Typography component="h1" variant="h5">Login</Typography>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                autoComplete="email"
                onChange={e => setData({ ...data, email: e.target.value })}
                value={data.email}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Senha"
                type="password"
                autoComplete="current-password"
                onChange={e => setData({ ...data, password: e.target.value })}
                value={data.password}
              />

              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Lembrar de mim"
              />

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Entrar
              </Button>

              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">Esqueceu a senha?</Link>
                </Grid>
                <Grid item>
                  <Link href="/register" variant="body2">Cadastre-se</Link>
                </Grid>
              </Grid>

              <br /> <br />

              <Typography variant="body2" color="text.secondary" align="center">
                {'Copyright © '}
                <Link color="inherit" href="https://meuapetite.com/">Meu apetite</Link>
                {' '} {new Date().getFullYear()}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <BackdropLoading loading={loading} />
      </Grid>
    </ThemeProvider>
  );
}
