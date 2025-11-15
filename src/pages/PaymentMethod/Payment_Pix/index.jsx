import { useState, useEffect, useContext } from 'react';
import { FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, TextField } from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';

const Payment_Pix = () => {
  const apiService = new ApiService();
  const { toast, company, setCompany } = useContext(GlobalContext);
  const [data, setData] = useState({ active: null, key: null, keyType: null, city: null, name: null });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    try {
      setLoading('Atualizando...');

      if (
        company.settingsPayment.pix.active === data.active
        && company.settingsPayment.pix.name === data.name
        && company.settingsPayment.pix.city === data.city
        && company.settingsPayment.pix.key === data.key
        && company.settingsPayment.pix.keyType === data.keyType
      ) return toast.error('Nenhuma alteração a ser feita');

      if (data.active) {
        if (!data.keyType) return toast.error('Selecione o tipo da chave');
        if (!data.key) return toast.error('Digite sua chave pix');

        if (data.keyType === 'email') {
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          if (!emailRegex.test(data.key)) {
            return toast.error('Digite um email válido para a chave PIX');
          }
        }

        if (data.keyType === 'cpf') {
          const cpfRegex = /^\d{11}$/;
          if (!cpfRegex.test(data.key)) {
            return toast.error('Digite um CPF válido para a chave PIX');
          }
        }

        if (data.keyType === 'telefone') {
          const telefoneRegex = /^\d{10,11}$/;
          if (!telefoneRegex.test(data.key)) {
            return toast.error('Digite um telefone válido para a chave PIX');
          }
        }
      }

      const response = await apiService.put('/admin/payments/pix', data);

      setCompany({
        ...company,
        settingsPayment: {
          ...company.settingsPayment, pix: response.data
        }
      });

      if (response.data.success === false) return toast.error(response.data?.message);

      toast.success('Dados atualizados!');
    } catch (e) {
      toast.error(e.response.data?.message || 'Não foi possível atualizar os dados PIX');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData({
      ...data,
      active: company.settingsPayment.pix.active,
      keyType: company.settingsPayment.pix?.keyType || null,
      key: company.settingsPayment.pix?.key || null,
      name: company.settingsPayment.pix?.name || null,
      city: company.settingsPayment.pix?.city || null,
    });
  }, []);

  return (
    <section style={{ marginBottom: '48px' }}>
      <p>Seus clientes podem comprar via PIX, recebendo um QR code com as informações da sua conta abaixo. Você é responsável pela verificação do pagamento.</p>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={data.active}
                onChange={(e) => setData({ ...data, active: e.target.checked })}
              />
            }
            label={"Pagamento por PIX"}
          />
        </Grid>

        {data.active && (
          <>
            <Grid item xs={12}>
              <TextField
                label="Nome completo do titular da conta PIX"
                fullWidth={true}
                InputLabelProps={{ shrink: data.name !== '' }}
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                margin="dense"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl sx={{ width: '100%' }}>
                <InputLabel id="keyType">Tipo de chave</InputLabel>
                <Select
                  labelId="keyType"
                  value={data.keyType}
                  onChange={(e) => setData({ ...data, keyType: e.target.value })}
                  label="Tipo de chave"
                  fullWidth
                >
                  <MenuItem value={'telefone'}>Número de celular</MenuItem>
                  <MenuItem value={'email'}>E-mail</MenuItem>
                  <MenuItem value={'cpf'}>CPF</MenuItem>
                  <MenuItem value={'aleatorio'}>Aleatório</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Chave pix"
                fullWidth={true}
                InputLabelProps={{ shrink: data.key !== '' }}
                value={data.key}
                onChange={(e) => setData({ ...data, key: e.target.value })}
                margin="dense"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="cidade do titular da conta PIX"
                fullWidth={true}
                InputLabelProps={{ shrink: data.city !== '' }}
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                margin="dense"
              />
            </Grid>
          </>
        )}
      </Grid>
      <ButtonFloat text={'Salvar'} onClick={save} />
      <BackdropLoading loading={loading} />
    </section>
  );
};

export default Payment_Pix;
