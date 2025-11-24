import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  TextField, 
  MenuItem, 
  Switch, 
  FormControlLabel,
  Typography
} from '@mui/material';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import ButtonFloat from 'components/ButtonFloat';

const Create = () => {
  const apiService = new ApiService();
  const navigate = useNavigate();
  const { setLoading, toast } = useContext(GlobalContext);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscountValue: '',
    usageLimit: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      if (!formData.code || !formData.name || !formData.discountValue || !formData.validUntil) {
        return toast.error('Preencha todos os campos obrigatórios');
      }

      if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
        return toast.error('Desconto percentual deve estar entre 0 e 100');
      }

      if (formData.discountType === 'fixed' && formData.discountValue < 0) {
        return toast.error('Desconto fixo deve ser maior ou igual a zero');
      }

      setLoading('Criando cupom...');
      
      const dataToSend = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        maxDiscountValue: formData.maxDiscountValue ? parseFloat(formData.maxDiscountValue) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : new Date().toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
      };

      await apiService.post('/admin/coupons', dataToSend);

      toast.success('Cupom criado com sucesso!');
      setTimeout(() => {
        navigate('/coupons');
        setLoading(false);
      }, 1000);
    } catch (e) {
      console.log(e);
      setLoading(false);
      const errorMessage = e.response?.data?.error || 'Erro ao criar o cupom';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Header title="Novo cupom" back={-1} />
      <Box component="section" sx={{ px: 2, py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField 
              required 
              fullWidth 
              label="Código do cupom" 
              name="code"
              value={formData.code}
              onChange={handleChange}
              helperText="O código será convertido para maiúsculas"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              required 
              fullWidth 
              label="Nome" 
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Descrição" 
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              select
              label="Tipo de desconto"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
            >
              <MenuItem value="percentage">Percentual (%)</MenuItem>
              <MenuItem value="fixed">Valor Fixo (R$)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              required 
              fullWidth 
              type="number"
              label={formData.discountType === 'percentage' ? 'Percentual (%)' : 'Valor (R$)'}
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              inputProps={{ 
                min: 0, 
                max: formData.discountType === 'percentage' ? 100 : undefined,
                step: formData.discountType === 'percentage' ? 1 : 0.01
              }}
            />
          </Grid>
          {formData.discountType === 'percentage' && (
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                type="number"
                label="Valor máximo de desconto (R$)"
                name="maxDiscountValue"
                value={formData.maxDiscountValue}
                onChange={handleChange}
                helperText="Limite máximo do desconto em reais (opcional)"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              type="number"
              label="Valor mínimo do pedido (R$)"
              name="minOrderValue"
              value={formData.minOrderValue}
              onChange={handleChange}
              helperText="Valor mínimo do pedido para usar o cupom (opcional)"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              type="number"
              label="Limite de uso"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              helperText="Número máximo de vezes que o cupom pode ser usado (opcional)"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              type="date"
              label="Válido a partir de"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              required
              fullWidth 
              type="date"
              label="Válido até"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formData.validFrom }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange}
                  name="isActive"
                />
              }
              label="Cupom ativo"
            />
          </Grid>
        </Grid>
      </Box>
      <ButtonFloat type="submit" text="Salvar" />
    </form>
  );
};

export default Create;

