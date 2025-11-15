import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';

const ConfirmAction = (props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(props.open)
  }, []);

  return (
    <Dialog open={open}>
      <DialogTitle>{props.title || 'Tem certeza de que deseja continuat?'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Esta ação é irreversível e a exclusão não poderá ser desfeita,
          portanto, certifique-se de sua decisão antes de confirmar.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.confirm(false)}>Cancelar</Button>
        <Button onClick={() => props.confirm(true)}>Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmAction;
