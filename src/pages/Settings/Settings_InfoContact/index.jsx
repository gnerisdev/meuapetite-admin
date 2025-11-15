import React, { useContext, useEffect, useState } from 'react';
import { Box, Grid, TextField } from '@mui/material';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';
import PhoneInput from 'components/PhoneInput';

const Settings_InfoContact = () => {
  const apiService = new ApiService();
  const { toast, company, setCompany } = useContext(GlobalContext);
  const [data, setData] = useState({ phoneNumber: '', email: '' });
  const [loading, setLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setLoading('Agurade...');

    try {
      const response = await apiService.put('/admin/company/contact', data);
      setData(response.data);
      setCompany({ ...company, whastapp: response.data.whastapp, email: response.data.email });
      toast.success('Dados atualizados!');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getData = async (id) => {
    try {
      setData({ email: company.email, whatsapp: company.whatsapp });
    } catch (error) {
      toast.error('Não foi possível recuperar os dados');
    };
  };

  useEffect(() => {
    getData();
  }, []);

  return (

    <Box component="section" noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <TextField
            label="Email oficial"
            value={data?.email}
            type="email"
            onChange={(e) => setData({ ...data, email: e.target.value })}
            InputLabelProps={{ shrink: data.email }}
            margin="dense"
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <PhoneInput
            label="WhatsApp oficial"
            value={data?.whatsapp || ''}
            onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
            required
            fullWidth
          />
        </Grid>
      </Grid>

      <ButtonFloat text="Salvar" onClick={save} />

      <BackdropLoading loading={loading} />
    </Box>
  );
};

export default Settings_InfoContact;
