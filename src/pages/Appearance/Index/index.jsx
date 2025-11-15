import { useState, useEffect, useContext } from 'react';
import { ApiService } from 'services/api.service';
import { Avatar, TextField, Box, Grid, Tab, Tabs, FormControlLabel, Switch, Typography } from '@mui/material';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import * as S from './style';


const Create = () => {
  const apiService = new ApiService();
  const { toast, company, setCompany, themeMode, changeTheme } = useContext(GlobalContext);
  const [logo, setLogo] = useState();
  const [backgroundImage, setBackgroundImage] = useState();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const save = async (e) => {
    try {
      e.preventDefault();
      setLoading('Atualizando dados...');

      const form = new FormData(e.target);

      const response = await apiService.put('/admin/company/appearance', {
        fantasyName: form.get('fantasyName'),
        description: form.get('description'),
        slogan: form.get('slogan'),
        colorPrimary: form.get('colorPrimary'),
        colorSecondary: form.get('colorSecondary'),
      });
      setCompany(response.data);
    } catch (error) {
      console.log(e);

      toast.error('Não foi possível atualizar os dados');
    } finally {
      setLoading(null);
    }
  };

  const updateLogo = async (e) => {
    try {
      setLoading('Carregando...');
      const formData = new FormData();
      formData.append('logo', e.target.files[0]);
      const response = await apiService.post('/admin/company/logo', formData, true);
      setLogo(response.data.url);
      setCompany({
        ...company, custom: {
          ...company.custom, logo: response.data
        }
      });
      toast.success('Logo atualizada');
      if (!company.online) window.location.reload(false);
    } catch (e) {
      console.log(e);
      toast.error(e.response.data?.message || 'Não foi possível atualizar a logo');
    } finally {
      setLoading(false);
    }
  };

  const updateBackgroundImage = async (e) => {
    try {
      setLoading('Carregando...');
      const formData = new FormData();
      formData.append('backgroundImage', e.target.files[0]);
      const response = await apiService.post('/admin/company/backgroundImage', formData, true);
      setBackgroundImage(response.data.url);

      setCompany({
        ...company,
        custom: { ...company.custom, backgroundImage: response.data },
      });
      toast.success('Imagem de fundo atualizada');
    } catch (e) {
      console.log(e);
      toast.error(e.response.data?.message || 'Não foi possível atualizar a imagem de fundo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData({
      fantasyName: company.fantasyName,
      slogan: company.slogan,
      description: company.description,
      colorPrimary: company.custom.colorPrimary,
      colorSecondary: company.custom.colorSecondary,
    });
    setLogo(company.custom.logo?.url);
    setBackgroundImage(company.custom.backgroundImage?.url);
  }, [company]);

  return (
    data && (
      <form onSubmit={save}>
        <Header title="Aparência" back={-1} />

        <Box component="section" sx={{ mb: '48px' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: '16px' }}>
            <Tab label="Informações" />
            <Tab label="Logo" />
            <Tab label="Imagem de Fundo" />
          </Tabs>

          {tabValue === 1 && (
            <Box sx={{ display: 'grid', justifyContent: 'center', mb: 2 }}>
              <Avatar
                src={logo}
                sx={{ width: '150px', height: '150px', mb: 1, border: '2px solid' }}
              />
              <S.ButtonChangeLogo component="label" variant="outlined" color="info">
                <S.VisuallyHiddenInput type="file" onChange={(e) => updateLogo(e)} />
                Mudar logo
              </S.ButtonChangeLogo>
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ mb: 1.7 }}>
              <Box
                sx={{
                  width: '100%', height: { xs: '150px', sm: '240px' },
                  overflow: 'hidden',
                  border: '2px solid',
                  borderRadius: '4px'
                }}
              >
                <img
                  src={backgroundImage}
                  alt="Imagem de fundo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <S.ButtonChangeLogo
                  component="label"
                  variant="outlined"
                  color="info"
                  sx={{ maxWidth: '400px', width: '100%', mt: 1 }}
                >
                  <S.VisuallyHiddenInput type="file" onChange={(e) => updateBackgroundImage(e)} />
                  Mudar imagem de fundo
                </S.ButtonChangeLogo>
              </Box>
            </Box>
          )}

          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item sm={12} xs={12}>
                <TextField
                  label="Nome fantasia"
                  name="fantasyName"
                  defaultValue={data.fantasyName}
                  InputLabelProps={{ shrink: data.fantasyName?.length }}
                  margin="dense"
                  fullWidth
                  required
                />
              </Grid>

              <Grid item sm={12} xs={12}>
                <TextField
                  label="Descrição"
                  name="description"
                  defaultValue={data.description}
                  InputLabelProps={{ shrink: data.description?.length }}
                  rows={3}
                  margin="dense"
                  multiline
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField
                  label="Slogan"
                  name="slogan"
                  defaultValue={data.slogan}
                  InputLabelProps={{ shrink: data.slogan?.length }}
                  margin="dense"
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={12} sx={{ mb: -1 }}>
                <span>
                  Escolha duas cores (cor principal e cor secundária) para ser a
                  cor tema do seu cardápio. As cores serão utilizadas também aqui
                  no seu painel
                </span>
              </Grid>

              <Grid item xs={4} sm={4}>
                <TextField
                  label="Cor principal"
                  name="colorPrimary"
                  defaultValue={data.colorPrimary}
                  margin="dense"
                  type="color"
                  InputLabelProps={{ shrink: data.slogan?.length }}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={4} sm={4}>
                <TextField
                  label="Cor secundária"
                  defaultValue={data.colorSecondary}
                  name="colorSecondary"
                  margin="dense"
                  type="color"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={12} sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>
                  Aparência
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeMode === 'dark'}
                      onChange={(e) => changeTheme(e.target.checked ? 'dark' : 'light')}
                      color="primary"
                    />
                  }
                  label="Modo escuro"
                />
              </Grid>

              <ButtonFloat text={'salvar'} type="submit" />
            </Grid>
          )}
        </Box>

        <BackdropLoading loading={loading} />
      </form>
    )
  );
};

export default Create;
