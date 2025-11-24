import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  TextField, 
  MenuItem, 
  Switch, 
  FormControlLabel
} from '@mui/material';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';

const Update = () => {
  const apiService = new ApiService();
  const navigate = useNavigate();
  const { id } = useParams();
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
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const [loading, setLoadingState] = useState(true);

  useEffect(() => {
    const getCoupon = async () => {
      try {
        setLoadingState(true);
        const { data } = await apiService.get(`/admin/coupons/${id}`);
        
        setFormData({
          code: data.code || '',
          name: data.name || '',
          description: data.description || '',
          discountType: data.discountType || 'percentage',
          discountValue: data.discountValue || '',
          minOrderValue: data.minOrderValue || '',
          maxDiscountValue: data.maxDiscountValue || '',
          usageLimit: data.usageLimit || '',
          validFrom: data.validFrom ? new Date(data.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          validUntil: data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
      } catch (e) {
        console.log(e);
        toast.error('Erro ao carregar cupom');
        navigate('/coupons');
      } finally {
        setLoadingState(false);
      }
    };

    if (id) {
      getCoupon();
    }
  }, [id, apiService, navigate, toast]);

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

      setLoading('Atualizando cupom...');
      
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

      await apiService.put(`/admin/coupons/${id}`, dataToSend);

      toast.success('Cupom atualizado com sucesso!');
      setTimeout(() => {
        navigate('/coupons');
        setLoading(false);
      }, 1000);
    } catch (e) {
      console.log(e);
      setLoading(false);
      const errorMessage = e.response?.data?.error || 'Erro ao atualizar o cupom';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <BackdropLoading loading="Carregando..." />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Header title="Editar cupom" back={-1} />
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

export default Update;

