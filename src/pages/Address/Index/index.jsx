import { useContext, useEffect, useState } from 'react';
import { Box, Grid, TextField } from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import Header from 'components/Header';
import FindAddress from 'components/FindAddress';
import { propsTextField } from 'utils/form';


const Address = () => {
  const apiService = new ApiService();

  const { toast, company, setCompany } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    city: '',
    district: '',
    street: '',
    zipCode: '',
  });
  const [openEditorAddress, setOpenEditorAddress] = useState(false);

  const getAddress = async () => {
    if (!company?.address?.zipCode) return;
    setData(company.address);
  };

  const updateAddress = async (address) => {
    try {
      setLoading('Atualizando endereço');
      const { data } = await apiService.put('/admin/company/address', address);
      console.log(data)
      setCompany({ ...company, address: data });
      setData(data);
      toast.success('Endereço atualizado');

      if (!company.online) window.location.reload(false);
    } catch (error) {
      toast.error(
        'Não foi possível atualizar o endereço. caso não esteja consiguindo, entre em contato conosco.',
      );
    } finally {
      setOpenEditorAddress(false);
      setLoading(null);
    }
  };

  useEffect(() => {
    getAddress();
  }, []);

  return (
    <>
      <Header 
        title="Endereço" 
        back={-1} 
        buttonText="Novo endereço"
        buttonClick={() => setOpenEditorAddress(!openEditorAddress)}
      />

      <Box component="section" noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <span>
              {
                data.zipCode.length >= 8
                  ? 'Para mudar o endereço clique em "NOVO ENDEREÇO"'
                  : 'Registre o endereço para o seu negócio! Isso nos ajuda'
                  + ' a calcular o custo de entrega ou facilita para o'
                  + ' cliente que prefira retirar pessoalmente o pedido.'
              }
            </span>
          </Grid>
          {data.zipCode.length >= 8 && (
            <>
              <Grid item xs={12} sm={12}>
                <TextField
                  disabled
                  label="Cep"
                  value={data.zipCode}
                  {...propsTextField}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  disabled
                  label="Cidade"
                  value={data.city}
                  {...propsTextField}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  disabled
                  label="Referência/complemento"
                  value={data.reference}
                  {...propsTextField}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  disabled
                  label="Bairro"
                  value={data.district}
                  {...propsTextField}
                />
              </Grid>
              <Grid item xs={9} sm={9}>
                <TextField
                  disabled
                  label="Rua"
                  value={data.street}
                  {...propsTextField}
                />
              </Grid>
              <Grid item xs={3} sm={3}>
                <TextField
                  disabled
                  label="Número"
                  value={data.number}
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
    </>
  );
};

export default Address;
