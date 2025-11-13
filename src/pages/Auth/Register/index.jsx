import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  InputAdornment,
  CssBaseline,
  Checkbox,
  FormControlLabel,
  Typography,
  Container,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ThemeProvider } from '@mui/material/styles';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import BackdropLoading from 'components/BackdropLoading';
import * as S from './style';


const Register = () => {
  const apiService = new ApiService(false);
  const navigate = useNavigate();
  const { toast } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState(false);
  const [data, setData] = useState({
    email: '',
    password: '',
    passwordRepeat: '',
    storeUrl: '',
    fantasyName: '',
    ownerName: '',
    description: '',
    whatsapp: ''
  });

  const toastSuport = () => {
    toast.error(
      <div>
        Não foi possível fazer o cadastro, caso precise de ajuda entre em
        contato com nosso suporte
        <Button variant="outlined" color="success" sx={{ width: '100%' }}>
          <i
            className="fa-brands fa-whatsapp"
            style={{ fontSize: '1.2rem' }}
          ></i>
          <span> Chamar suporte</span>
        </Button>
      </div>,
      { duration: 5000 },
    );
  };

  const handleSubmit = async (e) => {
    try {
      if (
        !data.email || !data.password || !data.passwordRepeat ||
        !data.fantasyName || !data.ownerName || !data.storeUrl ||
        !data.whatsapp
      ) {
        return toast.error('Todos os campos precisam serem preencidos!');
      }

      if (data.password !== data.passwordRepeat) {
        return toast.error('As senhas não correspondem');
      }

      if (!terms) {
        return toast.error('Você deve aceitar os termos para prosseguir');
      }

      setLoading('Fazendo cadastro...');

      const response = await apiService.post('/auth/register', data);

      if (!response || !response.data) {
        return toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      }

      if (!response.data.success) {
        if (!response.data.message) return toastSuport();
        return toast.error(response.data.message);
      }

      toast.success('Successo! Faça o login para continuar.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      let errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        return toast.error(errorMessage);
      } else if (error?.message) {
        errorMessage = error.message;
        return toast.error(errorMessage);
      }
      
      return toastSuport();
    } finally {
      setTimeout(() => setLoading(false));
    }
  };

  return (
    <ThemeProvider theme={S.ThemeDark}>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockOutlinedIcon /></Avatar>
          <Typography component="h1" variant="h5">Nova conta</Typography>

          <Box component="form" sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Seu nome"
                  autoFocus
                  data={data.ownerName}
                  onChange={(e) => setData({ ...data, ownerName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do seu negócio"
                  data={data.fantasyName}
                  onChange={(e) => setData({ ...data, fantasyName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  label="Descrição (fale sobre seu negócio)"
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  rows={3}
                  multiline
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link personalizado"
                  value={data.storeUrl}
                  InputProps={{
                    startAdornment:
                      <InputAdornment position="start" sx={{ color: '#ff7f32' }}>
                        {'https://meuapetite.com'}/
                      </InputAdornment>
                  }}
                  onChange={(e) => setData({ ...data, storeUrl: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  value={data.email}
                  label="Email do negócio"
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="tel"
                  value={data.whatsapp}
                  label="Whatsapp do negócio"
                  onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Senha"
                  type="password"
                  name="password"
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Repita a senha"
                  type="password"
                  name="passwordRepeat"
                  value={data.passwordRepeat}
                  onChange={(e) => setData({ ...data, passwordRepeat: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value={terms} onChange={() => setTerms(!terms)} color="primary" />}
                  label={<Link href="/terms" target="blank">Eu aceito todos os termos.</Link>}
                />
              </Grid>

            </Grid>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSubmit}
            >
              Cadastrar
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login">Já tem uma conta? Entre agora!</Link>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
          {'Copyright © '}
          <Link color="inherit" href="">Meu apetite </Link>
          {new Date().getFullYear()}
        </Typography>
      </Container>

      <BackdropLoading loading={loading} />
    </ThemeProvider>
  );
};

export default Register;
