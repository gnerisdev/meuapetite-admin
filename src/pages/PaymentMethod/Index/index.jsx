import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tab, Tabs } from '@mui/material';
import Header from 'components/Header';

const PaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState('pay-pix');

  useEffect(() => {
    const tabValue = location.pathname.split('/').pop();
    if (tabValue !== 'payment-method') {
      setTabValue(tabValue);
    } else {
      const firstTabValue = 'pay-pix';
      setTabValue(firstTabValue);
      navigate(firstTabValue);
    }
  }, [location.pathname]);
 
  return (
    <section>
      <Header title="Formas de pagamento" back={-1} />
      <Tabs value={tabValue} onChange={(e, v) => navigate(v)}>
        <Tab value="pay-pix" label="Pix" />
        <Tab value="pay-in-delivery" label="Pagamento na entrega" />
        {/* <Tab value="online" label="Mercado pago" /> */}
      </Tabs>
      <Outlet /> 
    </section>
  );
};

export default PaymentMethod;
