import { useState } from 'react';
import { IconButton, useMediaQuery, Tabs, Tab, Box } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AddressCep from './AddressCep';
import AddressEdit from './AddressEdit';
import AddressMap from './AddressMap';
import * as S from './style';

const FindAddress = (props /* { getData() } */) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [address, setAddress] = useState({
    zipCode: null,
    city: null,
    state: null,
    street: null,
    district: null,
    number: null,
    complement: null,
    condominium: null,
  });
  const [openEdit, setOpenEdit] = useState('method');
  const [method, setMethod] = useState('map'); // 'map' ou 'cep'

  const getAddressCep = (data) => {
    setAddress(data);
    setOpenEdit('address');
  };

  const getAddressEdit = (data) => {
    setAddress(data);
    props.getData(data);
  };

  const getAddressMap = (data) => {
    props.getData(data);
  };

  return (
    <S.BootstrapDialog open={true} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Cadastro de endereço
      </DialogTitle>
      <IconButton
        onClick={props.closeModal}
        sx={{
          position: 'absolute', right: 8, top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers sx={{ minHeight: '500px' }}>
        {openEdit === 'method' && (
          <Box>
            <Tabs value={method} onChange={(e, v) => setMethod(v)} sx={{ mb: 3 }}>
              <Tab label="🌍 Mapa (Internacional)" />
              <Tab label="📮 CEP (Brasil)" />
            </Tabs>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <IconButton
                onClick={() => {
                  if (method === 'map') {
                    setOpenEdit('map');
                  } else {
                    setOpenEdit('cep');
                  }
                }}
                sx={{
                  fontSize: '1.2rem',
                  p: 3,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white',
                  },
                }}
              >
                {method === 'map' ? '🌍 Usar Mapa' : '📮 Usar CEP'}
              </IconButton>
            </Box>
          </Box>
        )}
        {openEdit === 'map' && (
          <AddressMap 
            getAddress={getAddressMap}
            onClose={() => setOpenEdit('method')}
          />
        )}
        {openEdit === 'cep' && (
          <AddressCep getAddress={(data) => getAddressCep(data)} />
        )}
        {openEdit === 'address' && (
          <AddressEdit address={address} getAddress={getAddressEdit} />
        )}
      </DialogContent>
    </S.BootstrapDialog>
  );
};

export default FindAddress;
