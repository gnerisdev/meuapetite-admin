import { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { AddIcon, DeleteIcon } from 'components/icons';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import { ApplicationUtils } from 'utils/ApplicationUtils';

const CreateManualOrder = ({ open, onClose, onSuccess }) => {
  const apiService = new ApiService();
  const { toast, company } = useContext(GlobalContext);
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [client, setClient] = useState({ name: '', phoneNumber: '', email: '' });
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [paymentType, setPaymentType] = useState('inDelivery');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [address, setAddress] = useState({
    street: '',
    number: '',
    district: '',
    city: '',
    reference: '',
    zipCode: ''
  });
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    if (open) {
      loadProducts();
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (company?.settingsPayment?.methods) {
      const firstMethod = company.settingsPayment.methods[0];
      if (firstMethod) {
        setPaymentMethod(firstMethod.id);
      }
    }
  }, [company]);

  const loadProducts = async () => {
    try {
      const { data } = await apiService.get('/admin/products?page=1&status=true');
      setProducts(data.products.filter(p => p.isActive));
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    }
  };

  const resetForm = () => {
    setClient({ name: '', phoneNumber: '', email: '' });
    setSelectedProducts([]);
    setDeliveryType('pickup');
    setPaymentType('inDelivery');
    setAddress({
      street: '',
      number: '',
      district: '',
      city: '',
      reference: '',
      zipCode: ''
    });
    setDeliveryFee(0);
  };

  const addProduct = (product) => {
    const existingIndex = selectedProducts.findIndex(p => p.productId === product._id);
    
    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].priceTotal = updated[existingIndex].price * updated[existingIndex].quantity;
      setSelectedProducts(updated);
    } else {
      const price = product.priceDiscount || product.price;
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product._id,
          productName: product.name,
          price: price,
          quantity: 1,
          priceTotal: price,
          complements: [],
          imageUrl: product.images?.[0]?.url || ''
        }
      ]);
    }
  };

  const removeProduct = (index) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const updateProductQuantity = (index, quantity) => {
    if (quantity < 1) return;
    const updated = [...selectedProducts];
    updated[index].quantity = quantity;
    updated[index].priceTotal = updated[index].price * quantity;
    setSelectedProducts(updated);
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, p) => sum + p.priceTotal, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (deliveryType === 'delivery' ? deliveryFee : 0);
  };

  const handleSubmit = async () => {
    if (!client.name || !client.phoneNumber) {
      toast.error('Nome e telefone do cliente são obrigatórios');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    if (!paymentMethod) {
      toast.error('Selecione um método de pagamento');
      return;
    }

    if (deliveryType === 'delivery' && (!address.street || !address.number)) {
      toast.error('Endereço completo é obrigatório para delivery');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        client,
        products: selectedProducts,
        deliveryType,
        paymentType,
        paymentMethod,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        deliveryFee: deliveryType === 'delivery' ? deliveryFee : 0
      };

      if (deliveryType === 'delivery') {
        orderData.address = {
          ...address,
          freeformAddress: `${address.street}, N°${address.number}${address.district ? ', ' + address.district : ''}${address.city ? ', ' + address.city : ''}`
        };
      }

      await apiService.post('/admin/orders/manual', orderData);
      
      toast.success('Pedido criado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Adicionar Pedido Manualmente
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Dados do Cliente */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Dados do Cliente</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome *"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefone *"
              value={client.phoneNumber}
              onChange={(e) => setClient({ ...client, phoneNumber: e.target.value })}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
            />
          </Grid>

          {/* Produtos */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Produtos</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Adicionar Produto</InputLabel>
              <Select
                value=""
                onChange={(e) => {
                  const product = products.find(p => p._id === e.target.value);
                  if (product) addProduct(product);
                }}
                label="Adicionar Produto"
              >
                {products.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name} - {ApplicationUtils.formatPrice(product.priceDiscount || product.price)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedProducts.map((product, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="bold">{product.productName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ApplicationUtils.formatPrice(product.price)} cada
                  </Typography>
                </Box>
                <TextField
                  type="number"
                  size="small"
                  value={product.quantity}
                  onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 80 }}
                />
                <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 100, textAlign: 'right' }}>
                  {ApplicationUtils.formatPrice(product.priceTotal)}
                </Typography>
                <IconButton onClick={() => removeProduct(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          ))}

          {/* Tipo de Entrega */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Entrega</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Entrega</InputLabel>
              <Select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
                label="Tipo de Entrega"
              >
                <MenuItem value="pickup">Retirada</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {deliveryType === 'delivery' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Taxa de Entrega"
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Rua *"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Número *"
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bairro"
                  value={address.district}
                  onChange={(e) => setAddress({ ...address, district: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Referência"
                  value={address.reference}
                  onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                />
              </Grid>
            </>
          )}

          {/* Pagamento */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Pagamento</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Pagamento</InputLabel>
              <Select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                label="Tipo de Pagamento"
              >
                <MenuItem value="inDelivery">Na Entrega</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="pix">PIX</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Método de Pagamento *</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Método de Pagamento *"
                required
              >
                {company?.settingsPayment?.methods?.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Resumo */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>Resumo</Typography>
              <Typography>Subtotal: {ApplicationUtils.formatPrice(calculateSubtotal())}</Typography>
              {deliveryType === 'delivery' && (
                <Typography>Taxa de Entrega: {ApplicationUtils.formatPrice(deliveryFee)}</Typography>
              )}
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: {ApplicationUtils.formatPrice(calculateTotal())}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Pedido'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateManualOrder;

