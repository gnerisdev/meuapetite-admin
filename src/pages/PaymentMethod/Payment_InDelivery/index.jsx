import { useState, useEffect, useContext } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import BackdropLoading from 'components/BackdropLoading';
import ButtonFloat from 'components/ButtonFloat';
import * as S from './style';

const Payment_InDelivery = () => {
  const apiService = new ApiService();
  const { toast, company } = useContext(GlobalContext);
  const [listPaymentMethods, setListPaymentMethods] = useState([]);
  const [paymentsmethods, setPaymentsmethods] = useState([]);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPaymentsmethods = async () => {
    try {
      setLoading('Carregando...');

      const { data: AllPayments } = await apiService.get('/admin/all-method-in-category');

      setIsActive(AllPayments, company.settingsPayment.methods);
      setListPaymentMethods([...AllPayments]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(null);
    }
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

  useEffect(() => {
    getPaymentsmethods();
  }, []);

  return (
    <section>
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
                  control={<Switch checked={m.isActive} onChange={() => toggleItem(index, m.id)} />}
                  label={m.title}
                />
              ))}
            </div>
          </S.CategoryPayment>
        );
      })}

      <ButtonFloat text={'Salvar'} onClick={savePayment} />
      <BackdropLoading loading={loading} />
    </section>
  );
};

export default Payment_InDelivery;
