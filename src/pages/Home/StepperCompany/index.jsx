import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel, Button, Typography, Container, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box } from '@mui/material';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import ButtonFloat from 'components/ButtonFloat';

const StepperCompany = () => {
  const { company, setCompany, toast } = useContext(GlobalContext);
  const [activeStep, setActiveStep] = useState(0);

  const Step1 = () => {
    const apiService = new ApiService();
    const storageKey = `verification_code_${company?._id || 'default'}`;
    const [code, setCode] = useState(() => {
      // Recuperar código do localStorage se existir
      const savedCode = localStorage.getItem(storageKey);
      return savedCode || '';
    });
    const [open, setOpen] = useState(() => {
      // Abrir dialog se já tiver código salvo
      return !!localStorage.getItem(storageKey);
    });
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
      setCodeSent(true);
    };

    const handleClose = () => {
      setOpen(false);
      // Não remover o código do localStorage ao fechar, apenas ao verificar com sucesso
    };

    const getCode = async () => {
      try {
        setSendingCode(true);
        await apiService.get('/admin/company/code');
        toast.success('Código enviado! Verifique seu email.');
        handleClickOpen();
      } catch (error) {
        toast.error('Erro ao enviar o código. Tente novamente.');
      } finally {
        setSendingCode(false);
      }
    };

    const verifyCode = async () => {
      try {
        if (!code || code.length !== 5) {
          return toast.error('Digite o código de 5 dígitos enviado para o seu email');
        }
        
        setLoading(true);
        const response = await apiService.post('/admin/company/code', { code });
        
        if (response.data.success) {
          // Remover código do localStorage após verificação bem-sucedida
          localStorage.removeItem(storageKey);
          setCompany({ ...company, verifyEmail: true });
          toast.success('Email verificado com sucesso!');
          handleClose();
        }
      } catch (e) {
        console.log(e);
        toast.error(e.response?.data?.message || 'Código incorreto. Tente novamente.');
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

    return (
      <div>
        {
          !company.verifyEmail ?
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Verificar E-mail</Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Para ativar sua conta e colocar sua loja online, precisamos verificar seu email.
                {codeSent && !open && (
                  <span style={{ display: 'block', marginTop: '8px', fontWeight: 'bold', color: 'primary.main' }}>
                    Código enviado! Verifique seu email.
                  </span>
                )}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button 
                  sx={{ mt: 1 }} 
                  variant="contained" 
                  onClick={getCode}
                  disabled={sendingCode}
                >
                  {sendingCode ? 'Enviando...' : codeSent ? 'Reenviar código' : 'Enviar código'}
                </Button>
                {codeSent && (
                  <Button 
                    sx={{ mt: 1 }} 
                    variant="outlined" 
                    onClick={handleClickOpen}
                  >
                    Inserir código
                  </Button>
                )}
              </Box>

              <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span className="fa fa-envelope" style={{ fontSize: '1.2rem' }}></span>
                    Confirmação de email
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ mb: 2 }}>
                    Insira o código de 5 dígitos enviado para:
                    <br />
                    <strong style={{ color: '#ff7f32' }}>{company.email}</strong>
                  </DialogContentText>
                  <TextField
                    autoFocus
                    value={code}
                    onChange={(e) => {
                      // Permitir apenas números e limitar a 5 dígitos
                      const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setCode(value);
                    }}
                    placeholder="00000"
                    fullWidth
                    inputProps={{
                      maxLength: 5,
                      style: { 
                        textAlign: 'center', 
                        fontSize: '1.5rem',
                        letterSpacing: '0.5rem',
                        fontWeight: 'bold'
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                  {code.length === 5 && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                      ✓ Código completo
                    </Typography>
                  )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button onClick={handleClose} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={verifyCode} 
                    variant="contained"
                    disabled={code.length !== 5 || loading}
                  >
                    {loading ? 'Verificando...' : 'Verificar'}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
            : <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
              <span className="fa fa-check-circle" style={{ fontSize: '1.5rem' }}></span>
              <Typography variant="h6">
                Email verificado! Vá para a próxima etapa.
              </Typography>
            </Box>
        }
      </div>
    );
  };

  const Step2 = () => {
    const navigate = useNavigate();
    const handleGoToAddress = () => navigate('/address');

    return (
      (!company?.address?.zipCode) ? (
        <div>
          <Typography variant="h6">Atualizar endereço</Typography>
          <Typography variant="p">
            Forneça o endereço do seu negócio. Este é um passo essencial para calcular
            o valor da entrega ou, se preferir, para que o cliente possa retirar o
            pedido pessoalmente.
          </Typography> <br />
          <Button sx={{ mt: 1 }} variant="contained" onClick={handleGoToAddress}>
            Ir para tela de endereço
          </Button>
        </div>
      )
        : (
          <strong>
            <span className="fa fa-check" style={{ marginRight: '0.5rem' }}></span>
            Endereço atualizado, vá para próxima etapa!
          </strong>
        )

    );
  };

  const Step3 = () => {
    const navigate = useNavigate();
    const handleGoToAddress = () => navigate('/appearance');

    return (
      <div>
        <Typography variant="h6">Atualizar logo</Typography>
        <Typography variant="p">Carregue a foto da logomarca do seu negócio</Typography> <br />
        <Button sx={{ mt: 1 }} variant="contained" onClick={handleGoToAddress}>
          Ir para tela de aparência
        </Button>
      </div>
    );
  };

  return (
    <Container>
      <h3>Siga os passos abaixo para ativar e disponibilizar o seu cardápio online.</h3>

      <Stepper sx={{ mb: 2 }} activeStep={activeStep} alternativeLabel>
        <Step key={0} completed={company?.verifyEmail}>
          <StepLabel></StepLabel>
        </Step>
        <Step key={1} completed={company?.address?.zipCode}>
          <StepLabel></StepLabel>
        </Step>
        <Step key={2} completed={company?.custom.logo?.url?.length > 0}>
          <StepLabel></StepLabel>
        </Step>
      </Stepper>

      {
        activeStep === 0 &&
        <>
          <Step1 />
          {company?.verifyEmail
            && <ButtonFloat text="Próxima etapa" onClick={() => setActiveStep(activeStep + 1)} />
          }
        </>
      }

      {
        activeStep === 1 &&
        <>
          <Step2 />
          {company?.address?.zipCode
            && <ButtonFloat text="Próxima etapa" onClick={() => setActiveStep(activeStep + 1)} />
          }
        </>
      }

      {
        activeStep === 2 &&
        <>
          <Step3 />
          {company?.custom.logo?.url?.length
            && <ButtonFloat text="Próxima etapa" onClick={() => setActiveStep(activeStep + 1)} />
          }
        </>
      }
    </Container>
  );
};

export default StepperCompany;
