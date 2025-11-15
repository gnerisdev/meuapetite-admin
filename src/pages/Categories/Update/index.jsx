import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';

const Update = () => {  
  const { id } = useParams();
  const apiService = new ApiService();
  const {setLoading, toast } = useContext(GlobalContext);  
  const [category, setCategory] = useState({ title: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading('Atualizando');

      if (!category.title.trim().length) return toast('Preencha o campo "Nome"', { icon: 'ℹ️' });
      
      const response = await apiService.put(`/admin/categories/name/${category._id}`, { title: category.title });
    
      if(response.data.success === false) {
        return toast.error(response.data.message);
      }
  
      setCategory(response.data);
      toast.success('Atualizado!');
    } catch (e) {
      console.log(e)
      toast.error('Erro ao atualizar a categoria.');
    } finally {
      setLoading(null);
    }
  };

  const getCategory = async () => {
    const response = await apiService.get(`/admin/categories/${id}`);
    const data = response.data;

    setCategory(data);
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <>
      <Box component="section" noValidate>
        <Header title="Editar categoria" back={-1} buttonText="Salvar" buttonClick={handleSubmit} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <TextField
              margin="dense"
              required
              fullWidth
              name="title"
              label="Nome"
              InputLabelProps={{ shrink: true }}
              value={category.title}
              onChange={(e) => setCategory({ ...category, title: e.target.value })}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Update;
