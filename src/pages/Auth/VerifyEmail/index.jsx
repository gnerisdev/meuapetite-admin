import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Email,
  CheckCircle,
  Refresh,
  ArrowBack,
} from '@mui/icons-material';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import * as S from './style';

const VerifyEmail = () => {
  const { company, setCompany, toast } = useContext(GlobalContext);
  const navigate = useNavigate();
  const apiService = new ApiService();
  const storageKey = `verification_code_${company?._id || 'default'}`;
  
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem(storageKey);
    return savedCode || '';
  });
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');

  // Verificar se email já está verificado
  useEffect(() => {
    if (company?.verifyEmail) {
      navigate('/home', { replace: true });
    }
  }, [company?.verifyEmail, navigate]);

  const getCode = async () => {
    try {
      setSendingCode(true);
      setError('');
      await apiService.get('/admin/company/code');
      toast.success('Código enviado! Verifique seu email.');
      setCodeSent(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar o código. Tente novamente.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    try {
      if (!code || code.length !== 5) {
        setError('Digite o código de 5 dígitos enviado para o seu email');
        return;
      }
      
      setLoading(true);
      setError('');
      const response = await apiService.post('/admin/company/code', { code });
      
      if (response.data.success) {
        localStorage.removeItem(storageKey);
        setCompany({ ...company, verifyEmail: true });
        toast.success('Email verificado com sucesso!');
        setTimeout(() => navigate('/home'), 1000);
      }
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Código incorreto. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Salvar código no localStorage sempre que mudar
  useEffect(() => {
    if (code && code.length > 0) {
      localStorage.setItem(storageKey, code);
    }
  }, [code, storageKey]);

  // Enviar código automaticamente ao carregar se não tiver código salvo
  useEffect(() => {
    if (!codeSent && !code && company?._id) {
      getCode();
    } else if (code) {
      setCodeSent(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton 
          onClick={() => navigate('/home')} 
          sx={{ 
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
          Verificação de Email
        </Typography>
      </Box>

      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.7,
                  },
                },
              }}
            >
              <Email sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Verifique seu email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enviamos um código de verificação para:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
              {company?.email}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              autoFocus
              fullWidth
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setCode(value);
                setError('');
              }}
              placeholder="00000"
              label="Código de verificação"
              error={!!error}
              disabled={loading}
              InputProps={{
                endAdornment: code.length === 5 && (
                  <InputAdornment position="end">
                    <CheckCircle color="success" />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  letterSpacing: '0.5rem',
                  fontWeight: 'bold',
                  '& input': {
                    textAlign: 'center',
                  },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderWidth: 2,
                  },
                },
              }}
            />
            {code.length === 5 && !error && (
              <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                ✓ Código completo
              </Typography>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={verifyCode}
            disabled={code.length !== 5 || loading}
            sx={{
              mb: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Verificando...
              </>
            ) : (
              'Verificar código'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Não recebeu o código?
            </Typography>
            <Button
              variant="outlined"
              startIcon={sendingCode ? <CircularProgress size={16} /> : <Refresh />}
              onClick={getCode}
              disabled={sendingCode}
              sx={{ 
                minWidth: 200,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {sendingCode ? 'Enviando...' : 'Reenviar código'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          O código expira em alguns minutos. Se não receber, verifique sua caixa de spam.
        </Typography>
      </Box>
    </Container>
  );
};

export default VerifyEmail;

