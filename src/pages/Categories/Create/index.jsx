import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, TextField, } from '@mui/material';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import ButtonFloat from 'components/ButtonFloat';

const Create = () => {
  const apiService = new ApiService();

  const navigate = useNavigate();
  const {setLoading, toast } = useContext(GlobalContext);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      const form = new FormData(e.target);

      if (!form.get('title').trim().length) {
        return toast('Preencha o campo "Nome"', { icon: 'ℹ️' });
      }

      setLoading('Criando categoria...');
      
      await apiService.post('/admin/categories', { title: form.get('title') });

      toast.success('Categoria criada!');
      setTimeout(() => {
        navigate('/categories');
        setLoading(false);
      }, 1000);
    } catch (e) {
      console.log(e)
      setLoading(false);
      toast.error('Erro ao criar a categoria');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Header title="Nova categoria" back={-1} />
      <Box component="section" noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <TextField required fullWidth label="Título" name="title" />
          </Grid>
        </Grid>
      </Box>
      <ButtonFloat type="submit" text="Salvar" />
    </form>
  );
};

export default Create;
