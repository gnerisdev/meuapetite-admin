import React, { useContext, useEffect, useState } from 'react';
import { Box, Grid, TextField, Tab, Tabs } from '@mui/material';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import ButtonFloat from 'components/ButtonFloat';
import FindAddress from 'components/FindAddress';
import { propsTextField } from 'utils/form';

const Settings_Info = () => {
  const apiService = new ApiService();
  const { toast, setLoading, company, setCompany } = useContext(GlobalContext);
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState({ name: '', email: '', whatsapp: '' });
  const [addressData, setAddressData] = useState({
    city: '',
    district: '',
    street: '',
    zipCode: '',
  });
  const [openEditorAddress, setOpenEditorAddress] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setLoading('Aguarde...');

    try {
      // Salvar dados do administrador
      const ownerData = {
        name: data.name,
        phoneNumber: company?.owner?.phoneNumber || '',
        email: company?.owner?.email || ''
      };
      const ownerResponse = await apiService.put('/admin/company/owner', ownerData);

      // Salvar dados de contato
      const contactResponse = await apiService.put('/admin/company/contact', {
        email: data.email,
        whatsapp: data.whatsapp
      });

      // Atualizar o contexto
      setCompany({
        ...company,
        owner: ownerResponse.data,
        email: contactResponse.data.email,
        whatsapp: contactResponse.data.whatsapp
      });

      toast.success('Dados atualizados!');
    } catch (error) {
      console.log(error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  const getAddress = async () => {
    if (!company?.address?.zipCode) return;
    setAddressData(company.address);
  };

  const updateAddress = async (address) => {
    try {
      setLoading('Atualizando endereço');
      const { data } = await apiService.put('/admin/company/address', address);
      setCompany({ ...company, address: data });
      setAddressData(data);
      toast.success('Endereço atualizado');
      setOpenEditorAddress(false);
    } catch (error) {
      toast.error(
        'Não foi possível atualizar o endereço. Caso não esteja conseguindo, entre em contato conosco.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      setData({
        name: company?.owner?.name || '',
        email: company?.email || '',
        whatsapp: company?.whatsapp || ''
      });
      getAddress();
    } catch (error) {
      toast.error('Não foi possível recuperar os dados');
    }
  }, [company]);

  return (
    <Box component="section" noValidate>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Dados" />
          <Tab label="Endereço" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                label="Nome"
                value={data?.name || ''}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                InputLabelProps={{ shrink: !!data.name }}
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                label="Email"
                value={data?.email || ''}
                type="email"
                onChange={(e) => setData({ ...data, email: e.target.value })}
                InputLabelProps={{ shrink: !!data.email }}
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                label="WhatsApp"
                value={data?.whatsapp || ''}
                type="phone"
                onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                InputLabelProps={{ shrink: !!data.whatsapp }}
                margin="dense"
                fullWidth
                required
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <ButtonFloat text="Salvar" onClick={save} />
          </Box>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <ButtonFloat 
              text="Novo endereço" 
              onClick={() => setOpenEditorAddress(!openEditorAddress)} 
            />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <span>
                {
                  addressData.zipCode?.length >= 8
                    ? 'Para mudar o endereço clique em "NOVO ENDEREÇO"'
                    : 'Registre o endereço para o seu negócio! Isso nos ajuda a calcular o custo de entrega ou facilita para o cliente que prefira retirar pessoalmente o pedido.'
                }
              </span>
            </Grid>
            {addressData.zipCode?.length >= 8 && (
              <>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled
                    label="Cep"
                    value={addressData.zipCode || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled
                    label="Cidade"
                    value={addressData.city || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled
                    label="Referência/complemento"
                    value={addressData.reference || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled
                    label="Bairro"
                    value={addressData.district || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={9} sm={9}>
                  <TextField
                    disabled
                    label="Rua"
                    value={addressData.street || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={3} sm={3}>
                  <TextField
                    disabled
                    label="Número"
                    value={addressData.number || ''}
                    {...propsTextField}
                  />
                </Grid>
              </>
            )}
            
            {openEditorAddress && (
              <FindAddress
                getData={updateAddress}
                closeModal={() => setOpenEditorAddress(false)}
              />
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Settings_Info;

