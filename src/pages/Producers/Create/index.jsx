import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, TextField } from '@mui/material';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import ButtonFloat from 'components/ButtonFloat';

const Create = () => {
  const apiService = new ApiService();
  const navigate = useNavigate();
  const { setLoading, toast } = useContext(GlobalContext);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      const form = new FormData(e.target);
      const name = form.get('name')?.trim();
      const description = form.get('description')?.trim() || '';

      if (!name || !name.length) {
        return toast('Preencha o campo "Nome"', { icon: 'ℹ️' });
      }

      setLoading('Criando produtor...');
      
      await apiService.post('/admin/producers', { name, description });

      toast.success('Produtor criado!');
      setTimeout(() => {
        navigate('/producers');
        setLoading(false);
      }, 1000);
    } catch (e) {
      console.log(e);
      setLoading(false);
      toast.error('Erro ao criar o produtor');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Header title="Novo produtor" back={-1} />
      <Box component="section" noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <TextField required fullWidth label="Nome" name="name" />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField 
              fullWidth 
              label="Descrição" 
              name="description" 
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </Box>
      <ButtonFloat type="submit" text="Salvar" />
    </form>
  );
};

export default Create;

