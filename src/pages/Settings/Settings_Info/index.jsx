import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Grid, TextField, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import ButtonFloat from 'components/ButtonFloat';
import FindAddress from 'components/FindAddress';
import PhoneInput from 'components/PhoneInput';
import { propsTextField } from 'utils/form';

const Settings_Info = () => {
  const { t } = useTranslation('admin');
  const apiService = new ApiService();
  const { toast, setLoading, company, setCompany } = useContext(GlobalContext);
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(() => {
    const tab = searchParams.get('tab');
    return tab ? parseInt(tab, 10) : 0;
  });
  const [data, setData] = useState({ name: '', fantasyName: '', description: '', slogan: '', email: '', whatsapp: '' });
  const [addressData, setAddressData] = useState({
    city: '',
    district: '',
    street: '',
    zipCode: '',
  });
  const [openEditorAddress, setOpenEditorAddress] = useState(false);

  const save = async (e) => {
    e.preventDefault();
      setLoading(t('common.wait'));

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

      // Salvar informações da loja (nome fantasia, descrição, slogan)
      const companyInfoResponse = await apiService.put('/admin/company/info', {
        fantasyName: data.fantasyName,
        description: data.description,
        slogan: data.slogan
      });

      // Atualizar o contexto
      setCompany({
        ...company,
        owner: ownerResponse.data,
        email: contactResponse.data.email,
        whatsapp: contactResponse.data.whatsapp,
        fantasyName: companyInfoResponse.data.fantasyName,
        description: companyInfoResponse.data.description,
        slogan: companyInfoResponse.data.slogan
      });

      toast.success(t('common.dataUpdated'));
    } catch (error) {
      console.log(error);
      toast.error(t('common.updateError'));
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
      setLoading(t('common.updatingAddress'));
      const { data } = await apiService.put('/admin/company/address', address);
      setCompany({ ...company, address: data });
      setAddressData(data);
      toast.success(t('common.addressUpdated'));
      setOpenEditorAddress(false);
    } catch (error) {
      toast.error(t('common.addressUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      setData({
        name: company?.owner?.name || '',
        fantasyName: company?.fantasyName || '',
        description: company?.description || '',
        slogan: company?.slogan || '',
        email: company?.email || '',
        whatsapp: company?.whatsapp || ''
      });
      getAddress();
    } catch (error) {
      toast.error(t('common.dataRetrieveError'));
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
          <Tab label={t('settings.data')} />
          <Tab label={t('settings.address')} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                label={t('settings.name')}
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
                label={t('settings.fantasyName')}
                value={data?.fantasyName || ''}
                onChange={(e) => setData({ ...data, fantasyName: e.target.value })}
                InputLabelProps={{ shrink: !!data.fantasyName }}
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                label={t('settings.storeDescription')}
                value={data?.description || ''}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                InputLabelProps={{ shrink: !!data.description }}
                rows={3}
                margin="dense"
                multiline
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                label={t('settings.slogan')}
                value={data?.slogan || ''}
                onChange={(e) => setData({ ...data, slogan: e.target.value })}
                InputLabelProps={{ shrink: !!data.slogan }}
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                label={t('common.email')}
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
              <PhoneInput
                label={t('settings.whatsapp')}
                value={data?.whatsapp || ''}
                onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                required
                fullWidth
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <ButtonFloat text={t('settings.save')} onClick={save} />
          </Box>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <ButtonFloat 
              text={t('settings.newAddress')} 
              onClick={() => setOpenEditorAddress(!openEditorAddress)} 
            />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <span>
                {
                  addressData.zipCode?.length >= 8
                    ? t('settings.changeAddress')
                    : t('settings.registerAddress')
                }
              </span>
            </Grid>
            {addressData.zipCode?.length >= 8 && (
              <>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled
                    label={t('settings.zipCode')}
                    value={addressData.zipCode || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled
                    label={t('settings.city')}
                    value={addressData.city || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled
                    label={t('settings.reference')}
                    value={addressData.reference || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled
                    label={t('settings.district')}
                    value={addressData.district || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={9} sm={9}>
                  <TextField
                    disabled
                    label={t('settings.street')}
                    value={addressData.street || ''}
                    {...propsTextField}
                  />
                </Grid>
                <Grid item xs={3} sm={3}>
                  <TextField
                    disabled
                    label={t('settings.number')}
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

