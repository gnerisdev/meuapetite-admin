import { useState, useEffect, useContext } from 'react';
import {
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import Header from 'components/Header';
import * as S from './style';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';

const PaymentMethod = () => {
  const apiService = new ApiService();
  const { toast, company } = useContext(GlobalContext);
  const [listPaymentMethods, setListPaymentMethods] = useState([]);
  const [paymentsmethods, setPaymentsmethods] = useState([]);
  const [tabValue, setTabValue] = useState('delivery');
  const [hasUpdate, setHasUpdate] = useState(false);
  const [dataMecardoPago, setDataMercardoPago] = useState({
    accessToken: '',
    publicKey: '',
  });
  const [dataPix, setDataPix] = useState({
    active: '', Key: '', KeyType: ''
  });
  const [hasUpdateDataMP, sethasUpdateDataMP] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPaymentsmethods = async () => {
    try {
      setLoading('Carregando...');

      const { data: AllPayments } = await apiService.get('/admin/all-method-in-category');

      setIsActive(AllPayments, company.settingsPayment.methods);
      setListPaymentMethods([...AllPayments]);

      setDataMercardoPago({
        accessToken: company.settinsPayment.mercadoPago?.accessToken
          ? '*******************************************' : '',
        publicKey: company.settinsPayment?.mercadoPago?.publicKey
          ? '*******************************************' : '',
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(null);
    }
  };

  const setIsActive = (AllPayments, ActivePayments) => {
    const paymentsMethods = AllPayments.map((item) => {
      return {
        titleCategory: item.titleCategory,
        methods: item.methods.map((m) => {
          ActivePayments.findIndex((pay) => pay.id === m.id) >= 0
            ? (m.isActive = true) : (m.isActive = false);
          return m;
        }),
      };
    });

    setPaymentsmethods(paymentsMethods);
  };

  const toggleItem = (index, id) => {
    const payments = [...paymentsmethods];
    const changeIndex = payments[index]['methods'].findIndex(
      (item) => item.id === id,
    );

    payments[index]['methods'][changeIndex]['isActive'] = !payments[index]
      .methods[changeIndex]['isActive'];

    setPaymentsmethods(payments);
    setHasUpdate(true);
  };

  const handleChange = (e, value) => {
    setTabValue(value);
    toast.remove();

    if (value !== 'online' || dataMecardoPago.publicKey.length >= 1) return;

    toast(
      <div>
        Caso precise de ajuda com a integração com o Mercado Pago, entre em
        contato com o nosso suporte.
        <S.ButtonSuport variant="outlined" color="success">
          <i
            className="fa-brands fa-whatsapp"
            style={{ fontSize: '1.2rem' }}
          ></i>
          <span>Chamar suporte</span>
        </S.ButtonSuport>
      </div>,
      { duration: 4000 },
    );
  };

  const savePayment = async () => {
    try {
      setLoading('Atualizando...');

      const data = [];
      const paymentsMethods = [...paymentsmethods];

      paymentsMethods.forEach((item) => {
        item.methods.forEach((m) => {
          if (!m.isActive) return;
          const modifiedMethod = JSON.parse(JSON.stringify(m));
          delete modifiedMethod.isActive;
          data.push(modifiedMethod);
        });
      });

      const response = await apiService.put('/admin/payments', data);

      setIsActive(listPaymentMethods, response.data);
      setHasUpdate(false);
      toast.success('Opções de pagamento atualizadas');
    } catch (error) {
      toast.error('Erro ao atualizar as opções de pagamento');
    } finally {
      setLoading(null);
    }
  };

  const saveCredentialsMP = async () => {
    try {
      setLoading('Atualizando...');
      if (!dataMecardoPago.accessToken || !dataMecardoPago.accessToken) {
        return toast.error('É necessário preencher os dois campos');
      }
      await apiService.put('/admin/paymentonline/mp', { ...dataMecardoPago });
      setHasUpdate(false);
      toast.success('Opções de pagamento atualizadas');
    } catch (error) {
      toast.error('Erro ao atualizar as opções de pagamento');
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    getPaymentsmethods();
  }, []);

  return (
    <section>
      <Header title="Formas de pagamento" back={-1} />

      <Tabs value={tabValue} onChange={handleChange}>
        <Tab value="delivery" label="Pagamento na entrega" />
        <Tab value="online-pix" label="Pix" />
        <Tab value="online" label="Mercado pago" />
      </Tabs>

      {tabValue === 'delivery' && (
        <S.Wrapper>
          <S.Title>
            Por favor, indique quais métodos de pagamento são aceitos no seu
            estabelecimento no momento da entrega.
          </S.Title>
          {paymentsmethods.map((item, index) => {
            return (
              <S.CategoryPayment key={item.titleCategory}>
                <S.SubTitle>{item.titleCategory}</S.SubTitle>
                <div className="methods">
                  {item.methods.map((m) => (
                    <FormControlLabel
                      key={m.id}
                      sx={{ my: 0.5, display: 'block' }}
                      control={
                        <Switch
                          checked={m.isActive} onChange={() => toggleItem(index, m.id)}
                        />
                      }
                      label={m.title}
                    />
                  ))}
                </div>
              </S.CategoryPayment>
            );
          })}

          <ButtonFloat text={'Salvar'} onClick={saveCredentialsMP} />
          <BackdropLoading loading={loading} />
        </S.Wrapper>
      )}

      {tabValue === 'online-pix' && (
        <S.Wrapper>
          <S.Title>Oferecemos pagamento online pelo Pix, o cliente</S.Title> <br />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Chave pix"
                fullWidth={true}
                InputLabelProps={{ shrink: dataMecardoPago.publicKey !== '' }}
                value={dataPix.key}
                onChange={(e) => {}}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
              <Select
                label="Tipo de chave PIX"
                fullWidth={true}
                value={dataPix.KeyType}
                onChange={(e) => setDataPix({ ...dataPix, KeyType: e.target.value })}
              >
                {['cpf', 'email', 'telefone', 'aleatoria'].map((type) => (
                  <MenuItem key={type} value={type}>{type}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          <ButtonFloat text={'Salvar'} onClick={saveCredentialsMP} />
          <BackdropLoading loading={loading} />
        </S.Wrapper>
      )}

      {tabValue === 'online' && (
        <S.Wrapper>
          <S.Title>
            Oferecemos pagamento online pelo Mercado Pago, com várias opções de
            pagamento para os seus clientes, incluindo PIX e cartões de crédito,
            sem exigir que tenham uma conta Mercado Pago.
          </S.Title>{' '}
          <br />
          <Grid container spacing={2}>
            <Grid item sm={12}>
              <strong>
                Vá para a sua conta Mercado Pago, copie as credenciais e cole
                nos campos abaixo.
              </strong>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Public Key"
                type="password"
                fullWidth={true}
                InputLabelProps={{ shrink: dataMecardoPago.publicKey !== '' }}
                value={dataMecardoPago.publicKey}
                onChange={(e) => {
                  setDataMercardoPago({
                    ...dataMecardoPago,
                    publicKey: e.target.value,
                  });
                  sethasUpdateDataMP(true);
                  toast.remove();
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Access accessToken"
                type="password"
                fullWidth={true}
                InputLabelProps={{ shrink: dataMecardoPago.accessToken !== '' }}
                value={dataMecardoPago.accessToken}
                onChange={(e) => {
                  setDataMercardoPago({
                    ...dataMecardoPago,
                    accessToken: e.target.value,
                  });
                  sethasUpdateDataMP(true);
                  toast.remove();
                }}
              />
            </Grid>
          </Grid>
          <ButtonFloat text={'Salvar'} onClick={saveCredentialsMP} />
          <BackdropLoading loading={loading} />
        </S.Wrapper>
      )}
    </section>
  );
};

export default PaymentMethod;
