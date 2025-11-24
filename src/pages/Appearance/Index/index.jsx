import { useState, useEffect, useContext } from 'react';
import { ApiService } from 'services/api.service';
import { 
  Avatar, 
  TextField, 
  Box, 
  Grid, 
  Tab, 
  Tabs, 
  FormControlLabel, 
  Switch, 
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { DeleteIcon, UploadIcon } from 'components/icons';
import { useTranslation } from 'react-i18next';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import * as S from './style';


const Create = () => {
  const { t } = useTranslation('admin');
  const apiService = new ApiService();
  const { toast, company, setCompany, themeMode, changeTheme } = useContext(GlobalContext);
  const [logo, setLogo] = useState();
  const [backgroundImage, setBackgroundImage] = useState();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [colorPrimary, setColorPrimary] = useState('');
  const [colorSecondary, setColorSecondary] = useState('');
  const [whatsappFixed, setWhatsappFixed] = useState(false);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const save = async (e) => {
    try {
      e.preventDefault();
      setLoading(t('common.updating'));

      const form = new FormData(e.target);

      const response = await apiService.put('/admin/company/appearance', {
        colorPrimary: form.get('colorPrimary'),
        colorSecondary: form.get('colorSecondary'),
        whatsappFixed: whatsappFixed,
      });
      setCompany(response.data);
    } catch (error) {
      console.log(e);

      toast.error(t('common.updateError'));
    } finally {
      setLoading(null);
    }
  };

  const updateLogo = async (e) => {
    try {
      setLoading(t('common.loading'));
      const formData = new FormData();
      formData.append('logo', e.target.files[0]);
      const response = await apiService.post('/admin/company/logo', formData, true);
      setLogo(response.data.url);
      setCompany({
        ...company, custom: {
          ...company.custom, logo: response.data
        }
      });
      toast.success(t('common.logoUpdated'));
      if (!company.online) window.location.reload(false);
    } catch (e) {
      console.log(e);
      toast.error(e.response.data?.message || t('common.logoUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const validateImageSize = (file) => {
    return new Promise((resolve, reject) => {
      const minWidth = 1200;
      const minHeight = 600;
      
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (img.width < minWidth || img.height < minHeight) {
          reject({
            message: `A imagem deve ter no mínimo ${minWidth}x${minHeight} pixels. A imagem selecionada tem ${img.width}x${img.height} pixels.`
          });
        } else {
          resolve(true);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject({ message: 'Erro ao carregar a imagem. Por favor, tente novamente.' });
      };
      
      img.src = objectUrl;
    });
  };

  const updateBackgroundImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validar tamanho da imagem antes de fazer upload
      await validateImageSize(file);
      
      setLoading(t('common.loading'));
      const formData = new FormData();
      formData.append('backgroundImage', file);
      const response = await apiService.post('/admin/company/backgroundImage', formData, true);
      setBackgroundImage(response.data.url);

      setCompany({
        ...company,
        custom: { ...company.custom, backgroundImage: response.data },
      });
      toast.success(t('common.backgroundImageUpdated'));
    } catch (error) {
      console.log(error);
      toast.error(error.message || error.response?.data?.message || t('common.backgroundImageUpdateError'));
    } finally {
      setLoading(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  useEffect(() => {
    const primary = company.custom.colorPrimary || '#800080';
    const secondary = company.custom.colorSecondary || '#00FF00';
    setData({
      colorPrimary: primary,
      colorSecondary: secondary,
    });
    setColorPrimary(primary);
    setColorSecondary(secondary);
    setLogo(company.custom.logo?.url);
    setBackgroundImage(company.custom.backgroundImage?.url);
    setWhatsappFixed(company.settings?.whatsappFixed || false);
  }, [company]);

  const handleColorChange = (colorType, value) => {
    if (colorType === 'primary') {
      setColorPrimary(value);
      setData({ ...data, colorPrimary: value });
    } else {
      setColorSecondary(value);
      setData({ ...data, colorSecondary: value });
    }
  };

  const removeLogo = async () => {
    if (!company.custom.logo?.id) return;
    try {
      setLoading('Removendo logo...');
      await apiService.delete(`/admin/company/logo/${company.custom.logo.id}`);
      setLogo(null);
      setCompany({
        ...company,
        custom: { ...company.custom, logo: null }
      });
      toast.success('Logo removida');
    } catch (error) {
      toast.error('Erro ao remover logo');
    } finally {
      setLoading(false);
    }
  };

  const removeBackgroundImage = async () => {
    if (!company.custom.backgroundImage?.id) return;
    try {
      setLoading('Removendo imagem de fundo...');
      await apiService.delete(`/admin/company/backgroundImage/${company.custom.backgroundImage.id}`);
      setBackgroundImage(null);
      setCompany({
        ...company,
        custom: { ...company.custom, backgroundImage: null }
      });
      toast.success('Imagem de fundo removida');
    } catch (error) {
      toast.error('Erro ao remover imagem de fundo');
    } finally {
      setLoading(false);
    }
  };

  return (
    data && (
      <form onSubmit={save}>
        <Header title={t('appearance.title')} back={-1} />

        <Box component="section" sx={{ mb: '48px' }}>
          <Box 
            sx={{ 
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <S.StyledTabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
            >
              <S.StyledTab label={t('appearance.colorsTheme')} />
              <S.StyledTab label={t('appearance.logoImages')} />
            </S.StyledTabs>
          </Box>

          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Cores do Tema
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Escolha duas cores para personalizar o visual do seu cardápio. 
                    A cor principal será usada em elementos destacados e a secundária em detalhes complementares.
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="input"
                          type="color"
                          name="colorPrimary"
                          value={colorPrimary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          sx={{
                            width: 60,
                            height: 60,
                            border: '2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            cursor: 'pointer',
                            padding: 0,
                            '&::-webkit-color-swatch-wrapper': {
                              padding: 0,
                            },
                            '&::-webkit-color-swatch': {
                              border: 'none',
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                            Cor Principal
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {colorPrimary}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="input"
                          type="color"
                          name="colorSecondary"
                          value={colorSecondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          sx={{
                            width: 60,
                            height: 60,
                            border: '2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            cursor: 'pointer',
                            padding: 0,
                            '&::-webkit-color-swatch-wrapper': {
                              padding: 0,
                            },
                            '&::-webkit-color-swatch': {
                              border: 'none',
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                            Cor Secundária
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {colorSecondary}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      WhatsApp Fixo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Ative para exibir um botão fixo de WhatsApp no canto inferior direito da loja.
                    </Typography>
                    
                    <Card variant="outlined">
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={whatsappFixed}
                              onChange={(e) => setWhatsappFixed(e.target.checked)}
                              color="primary"
                              size="medium"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Botão WhatsApp Fixo
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {whatsappFixed 
                                  ? 'Botão fixo ativado na loja' 
                                  : 'Botão fixo desativado'}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0 }}
                        />
                      </CardContent>
                    </Card>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Tema do Painel
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Escolha entre o modo claro ou escuro para o painel administrativo.
                    </Typography>
                    
                    <Card variant="outlined">
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={themeMode === 'dark'}
                              onChange={(e) => changeTheme(e.target.checked ? 'dark' : 'light')}
                              color="primary"
                              size="medium"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Modo Escuro
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {themeMode === 'dark' 
                                  ? 'Tema escuro ativado' 
                                  : 'Tema claro ativado'}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0 }}
                        />
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <ButtonFloat text="Salvar Cores" type="submit" />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Logo da Loja
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Faça upload da logo da sua loja. Recomendamos uma imagem quadrada com fundo transparente.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={logo}
                        sx={{ 
                          width: 200, 
                          height: 200, 
                          border: '3px solid',
                          borderColor: 'divider',
                          bgcolor: 'grey.100'
                        }}
                      >
                        {!logo && (
                          <Typography variant="body2" color="text.secondary">
                            Sem logo
                          </Typography>
                        )}
                      </Avatar>
                      {logo && (
                        <Tooltip title="Remover logo">
                          <IconButton
                            onClick={removeLogo}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'error.dark'
                              }
                            }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    
                    <S.ButtonChangeLogo 
                      component="label" 
                      variant="contained" 
                      startIcon={<UploadIcon />}
                      sx={{ 
                        minWidth: 200,
                        backgroundColor: '#1976d2 !important',
                        color: '#ffffff !important',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#1565c0 !important',
                          color: '#ffffff !important',
                        },
                        '& .MuiButton-startIcon': {
                          color: '#ffffff !important',
                        }
                      }}
                    >
                      {logo ? 'Alterar Logo' : 'Adicionar Logo'}
                      <S.VisuallyHiddenInput 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => updateLogo(e)} 
                      />
                    </S.ButtonChangeLogo>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Imagem de Fundo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Adicione uma imagem de fundo para personalizar ainda mais o visual do seu cardápio.
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      mb: 3, 
                      p: 2, 
                      bgcolor: 'info.light', 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'info.main'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'info.dark' }}>
                      📐 Requisitos de Tamanho
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      A imagem deve ter no mínimo <strong>1200x600 pixels</strong> para garantir uma boa qualidade em todos os dispositivos.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.75rem' }}>
                      Formatos aceitos: JPG, PNG, WebP
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: { xs: '200px', sm: '300px' },
                        overflow: 'hidden',
                        border: '3px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'grey.100',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {backgroundImage ? (
                        <>
                          <img
                            src={backgroundImage}
                            alt="Imagem de fundo"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                          />
                          <Tooltip title="Remover imagem">
                            <IconButton
                              onClick={removeBackgroundImage}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': {
                                  bgcolor: 'error.dark'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma imagem de fundo
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <S.ButtonChangeLogo
                      component="label"
                      variant="contained"
                      startIcon={<UploadIcon />}
                      sx={{ 
                        minWidth: 250,
                        backgroundColor: '#1976d2 !important',
                        color: '#ffffff !important',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#1565c0 !important',
                          color: '#ffffff !important',
                        },
                        '& .MuiButton-startIcon': {
                          color: '#ffffff !important',
                        }
                      }}
                    >
                      {backgroundImage ? 'Alterar Imagem' : 'Adicionar Imagem de Fundo'}
                      <S.VisuallyHiddenInput 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => updateBackgroundImage(e)} 
                      />
                    </S.ButtonChangeLogo>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

        </Box>

        <BackdropLoading loading={loading} />
      </form>
    )
  );
};

export default Create;
