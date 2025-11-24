import { useMediaQuery, Box, IconButton } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { CloseIcon } from 'components/icons';
import AddressAutocomplete from './AddressAutocomplete';
import * as S from './style';

const FindAddress = (props /* { getData(), closeModal, initialAddress } */) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <S.BootstrapDialog open={true} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Cadastro de endereço
        {props.closeModal && (
          <IconButton
            onClick={props.closeModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: '400px', position: 'relative' }}>
        <AddressAutocomplete
          getData={props.getData}
          closeModal={props.closeModal}
          initialAddress={props.initialAddress}
        />
      </DialogContent>
    </S.BootstrapDialog>
  );
};

export default FindAddress;
