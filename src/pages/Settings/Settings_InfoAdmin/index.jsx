import React, { useContext, useEffect, useState } from 'react';
import { Box, Grid, TextField } from '@mui/material';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import ButtonFloat from 'components/ButtonFloat';

const Settings_InfoAdmin = () => {
  const apiService = new ApiService();
  const { toast, setLoading, company, setCompany } = useContext(GlobalContext);
  const [data, setData] = useState({ name: '', phoneNumber: '', email: '' });

  const save = async (e) => {
    e.preventDefault();
    setLoading('Agurade...');

    try {
      const response = await apiService.put('/admin/company/owner', data);
      setCompany({ ...company, owner: response.data });
      toast.success('Dados atualizados!');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getData = async (id) => {
    try {
      setData(company.owner);
    } catch (error) {
      toast.error('Não foi possível recuperar os dados');
    };
  };

  useEffect(() => {
    console.log('222')
    getData();
  }, []);

  return (

    <Box component="section" noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <TextField
            label="Nome"
            value={data?.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            InputLabelProps={{ shrink: data.name }}
            margin="dense"
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            label="Email"
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
          <TextField
            label="Telefone"
            value={data?.phoneNumber}
            type="phone"
            onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
            InputLabelProps={{ shrink: data.phoneNumber }}
            margin="dense"
            fullWidth
            required
          />
        </Grid>
      </Grid>

      <ButtonFloat text="Salvar" onClick={save} />
    </Box>
  );
};

export default Settings_InfoAdmin;
