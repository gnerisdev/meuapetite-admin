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
  const { setLoading, toast } = useContext(GlobalContext);  
  const [producer, setProducer] = useState({ name: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading('Atualizando');

      if (!producer.name || !producer.name.trim().length) {
        return toast('Preencha o campo "Nome"', { icon: 'ℹ️' });
      }
      
      const response = await apiService.put(`/admin/producers/name/${producer._id}`, { 
        name: producer.name,
        description: producer.description || ''
      });
    
      if(response.data.success === false) {
        return toast.error(response.data.message);
      }
  
      setProducer(response.data);
      toast.success('Atualizado!');
    } catch (e) {
      console.log(e);
      toast.error('Erro ao atualizar o produtor.');
    } finally {
      setLoading(null);
    }
  };

  const getProducer = async () => {
    try {
      const response = await apiService.get(`/admin/producers/${id}`);
      const data = response.data;
      setProducer(data);
    } catch (e) {
      toast.error('Erro ao carregar o produtor');
    }
  };

  useEffect(() => {
    getProducer();
  }, []);

  return (
    <>
      <Box component="section" noValidate>
        <Header title="Editar produtor" back={-1} buttonText="Salvar" buttonClick={handleSubmit} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <TextField
              margin="dense"
              required
              fullWidth
              name="name"
              label="Nome"
              InputLabelProps={{ shrink: true }}
              value={producer.name}
              onChange={(e) => setProducer({ ...producer, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              margin="dense"
              fullWidth
              name="description"
              label="Descrição"
              InputLabelProps={{ shrink: true }}
              value={producer.description || ''}
              onChange={(e) => setProducer({ ...producer, description: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Update;

