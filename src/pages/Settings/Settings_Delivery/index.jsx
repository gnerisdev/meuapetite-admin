import { useState, useEffect, useContext } from 'react';
import { FormControl, Grid, InputLabel, MenuItem, TextField } from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import * as S from './style';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';

const Settings_Delivery = (props) => {
  const apiService = new ApiService();
  const { toast, company, setCompany } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    allowStorePickup: true,
    delivery: true,
    deliveryOption: 'customerPickup',
    minValue: 0,
    kmValue: 0,
    fixedValue: 0
  });
  const [dataFormat, setDataFormat] = useState({ minValue: '', kmValue: '', fixedValue: '' });

  const getData = async () => {
    try {
      setData(company.settingsDelivery);
      setDataFormat({
        minValue: company.settingsDelivery.minValue
          ?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        kmValue: company.settingsDelivery.kmValue
          ?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        fixedValue: company.settingsDelivery.fixedValue
          ?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      });
    } catch (error) {
      console.log(error);
      toast.error('Não foi possível recuperar os dados');
    }
  };

  const update = async () => {
    try {
      setLoading('Atualizando...');
      const form = { ...data };

      if (dataFormat.fixedValue ) {
        form.fixedValue = parseFloat(dataFormat.fixedValue.replace("R$", "").replace(',', '.'));
      }
      if (dataFormat.kmValue) {
        form.kmValue = parseFloat(dataFormat.kmValue.replace("R$", "").replace(',', '.'));
      }
      if (dataFormat.minValue) {
        form.minValue = parseFloat(dataFormat.minValue.replace("R$", "").replace(',', '.'));
      }

      const response = await apiService.put('/admin/company/settings-delivery', form);
      setCompany(response.data);
      toast.success('Dados atualizados!');
    } catch (error) {
      console.log(error);
      toast.error('Não foi possível atualizar os dados');
    } finally {
      setLoading(false);
    }
  };

  const maskFormat = (text) => {
    const number = parseInt(text.replace(/\D/g, ''), 10);
    if (isNaN(number)) return 'R$ 0.00';
    return 'R$ ' + (number / 100).toFixed(2);
  };

  useEffect(() => {
    getData();
  }, [company]);

  return (
    <section>
      <S.Wrapper>
        <S.Title>
          A responsabilidade pela entrega é sua. Disponibilizamos o cálculo de
          frete online para simplificar o processo, sendo você responsável pelo
          envio.
        </S.Title> <br />

        <FormControl fullWidth>
          <InputLabel>Opção de retirada</InputLabel>
          <S.SelectCustom
            label="Opção de retirada"
            value={data.allowStorePickup}
            onChange={(e) => setData({ ...data, allowStorePickup: e.target.value })}
          >
            <MenuItem sx={{ whiteSpace: 'unset', wordBreak: 'break-all' }} value={true}>
              Permitir retirada na loja: os clientes podem pegar os pedidos pessoalmente
            </MenuItem>
            <MenuItem sx={{ whiteSpace: 'unset', wordBreak: 'break-all' }} value={false}>
              Não permitir retirada na loja
            </MenuItem>
          </S.SelectCustom>
        </FormControl> <br />

        <FormControl fullWidth>
          <InputLabel>Opção de entrega</InputLabel>
          <S.SelectCustom
            value={data.delivery}
            label="Opção de entrega"
            onChange={(e) => setData({ ...data, delivery: e.target.value })}
          >
            <MenuItem value={true}>Sim - Ativar entrega</MenuItem>
            <MenuItem value={false}>Não - Desativar entrega</MenuItem>
          </S.SelectCustom>
        </FormControl> <br />

        {data.delivery ? (
          <>
            <FormControl fullWidth>
              <InputLabel>Estimativa de custo de entrega</InputLabel>
              <S.SelectCustom
                value={data.deliveryOption}
                label="Estimativa de custo de entrega"
                onChange={(e) => setData({ ...data, deliveryOption: e.target.value })}
              >
                <MenuItem value="automatic">Calcular valor com base na distância</MenuItem>
                <MenuItem value="fixed">Valor de entrega fixo</MenuItem>
                <MenuItem value="customerPickup">Combinar valor com o cliente</MenuItem>
              </S.SelectCustom>
            </FormControl> <br />

            <Grid container spacing={2}>
              {data.deliveryOption === 'automatic' ? (
                <>
                  <Grid item xs={6} sm={6}>
                    <TextField
                      label="Valor mínimo"
                      value={dataFormat?.minValue}
                      onChange={(e) => setDataFormat({ ...dataFormat, minValue: maskFormat(e.target.value) })}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <TextField
                      label="Valor por KM"
                      value={dataFormat?.kmValue}
                      onChange={(e) => setDataFormat({ ...dataFormat, kmValue: maskFormat(e.target.value) })}
                      fullWidth
                      required
                    />
                  </Grid>
                </>
              ) : null}

              {data.deliveryOption === 'fixed' ? (
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Valor fixo"
                    value={dataFormat?.fixedValue}
                    onChange={(e) => setDataFormat({ ...dataFormat, fixedValue: maskFormat(e.target.value) })}
                    fullWidth
                    required
                  />
                </Grid>
              ) : null}
            </Grid>
          </>
        ) : null}
      </S.Wrapper>

      <ButtonFloat text="Salvar" onClick={update} />

      <BackdropLoading loading={loading} />
    </section>
  );
};

export default Settings_Delivery;
