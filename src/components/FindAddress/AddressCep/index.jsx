import { useState } from 'react';
import axios from 'axios';
import { Button, TextField } from '@mui/material';
import toast from 'react-hot-toast';
import LoadingAnimation from 'components/LoadingAnimation';
import * as S from './style';

const AddressCep = (props /* { getAddress() } */) => {
  const [loading, setLoading] = useState(false);
  const [cep, setCep] = useState(null);

  const findCep = async () => {
    try {
      setLoading(true);

      const numberCep = cep?.replace(/\D/g, "");

      if (numberCep.toString().length !== 8) return toast.error('Cep incorreto');

      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

      if (response.data?.erro) return toast.error('Cep incorreto');

      props.getAddress({
        zipCode: response.data.cep,
        city: response.data.localidade,
        state: response.data.uf,
        district: response.data.bairro,
        street: response.data.logradouro,
      });
    } catch (error) {
      console.log(error)
      toast.error('Não foi possível encontrar o cep');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <S.Title>Insira seu CEP corretamente</S.Title>
      <TextField
        placeholder="Escreva seu CEP"
        variant="outlined"
        fullWidth
        onChange={(e) => setCep(e.target.value)}
      />

      {
        loading ? <LoadingAnimation /> : (
          <Button
            sx={{ mt: 1 }}
            variant="contained"
            fullWidth
            onClick={findCep}
          >
            Buscar
          </Button>
        )
      }
    </>
  );
};

export default AddressCep;
