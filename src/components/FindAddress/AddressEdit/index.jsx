import { useContext, useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import * as S from './style';
import { GlobalContext } from 'contexts/Global';

const AddressEdit = (props /* { getAddress(), address } */) => {
  const { toast } = useContext(GlobalContext);
  const initialAddress = {
    zipCode: null,
    city: null,
    state: null,
    street: null,
    district: null,
    number: null,
    complement: null,
  };
  const [address, setAddress] = useState(initialAddress);
  const [edit, setEdit] = useState(false);

  const confirmAddress = () => {
    const errors = [];
    if (!address.zipCode) errors.push('Cep deve ser preenchido');
    if (!address.city) errors.push('Cidade deve ser preenchido');
    if (!address.street) errors.push('Cidade deve ser preenchido');
    if (!address.district) errors.push('Bairro deve ser preenchido');
    if (!address.number) errors.push('Número deve ser preenchido');

    if(errors <= 0) return props.getAddress(address)
    toast.error(errors.map(error => `• ${error}.`).join('\n'));
  };

  useEffect(() => {
    setAddress({ ...address, ...props.address });
  }, []);

  return (
    <>
      <S.Title>Verifique seu enderço com atenção!</S.Title>

      <TextField
        fullWidth
        label="Cep"
        value={address?.zipCode}
        disabled={!edit}
        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
        margin="dense"
      />
      <TextField
        fullWidth
        label="Rua"
        value={address?.street}
        disabled={!edit}
        onChange={(e) => setAddress({ ...address, street: e.target.value })}
        margin="dense"
      />
      <TextField
        fullWidth
        label="Bairro"
        value={address?.district}
        disabled={!edit}
        onChange={(e) => setAddress({ ...address, district: e.target.value })}
        margin="dense"
      />
      <TextField
        fullWidth
        label="Cidade"
        value={address?.city}
        disabled={!edit}
        onChange={(e) => setAddress({ ...address, city: e.target.value })}
        margin="dense"
        sx={{ mb: 2 }}
      />

      <strong>Outras Informações</strong>

      <TextField
        fullWidth
        label="Número do local"
        value={address?.number}
        onChange={(e) => setAddress({ ...address, number: e.target.value })}
        margin="dense"
      />
      <TextField
        fullWidth
        label="Ponto de referência/complemento"
        value={address?.reference}
        onChange={(e) => setAddress({ ...address, reference: e.target.value })}
        margin="dense"
      />

      <Button
        sx={{ mt: 1, mb: 1 }}
        variant="contained"
        fullWidth
        onClick={confirmAddress}
      >
        Confirmar
      </Button>

      <Button
        fullWidth
        color="inherit"
        onClick={() => {
          toast.error('Se você está enfrentando dificuldades ao buscar o endereço pelo CEP, experimente inserir o endereço completo.');
          setAddress({ zipCode: '', city: '', street: '', district: '', number: '' });
          setEdit(true)
        }}
      >
        Endereço errado? Clique aqui!
      </Button>
    </>
  );
};

export default AddressEdit;
