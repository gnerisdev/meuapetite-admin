import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import * as S from './Cart.style';

const Cart = ({ open, onClose, cart, store, onUpdateCart, apiService, primaryColor, secondaryColor, trackCartEvent }) => {
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState({ name: '', email: '', phoneNumber: '' });
  const [addressData, setAddressData] = useState({ 
    street: '', 
    number: '', 
    district: '', 
    city: '', 
    zipCode: '',
    reference: '' 
  });
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (cart?.client) {
      setClientData(cart.client);
    }
  }, [cart]);

  // Rastrear abertura do carrinho
  useEffect(() => {
    if (open && store?._id && cart?.products?.length > 0 && trackCartEvent) {
      const cartItems = cart.products.map(p => ({
        productId: p.productId,
        productName: p.productName,
        quantity: p.quantity,
        variations: p.complements,
        price: p.price
      }));
      trackCartEvent('open', null, null, null, cartItems);
    }
  }, [open, store?._id, cart?.products, trackCartEvent]);

  const updateProductQuantity = async (productIndex, delta) => {
    if (!cart) return;

    const updatedProducts = [...cart.products];
    const product = updatedProducts[productIndex];
    
    if (product.quantity + delta <= 0) {
      updatedProducts.splice(productIndex, 1);
    } else {
      product.quantity += delta;
      product.priceTotal = (product.price + 
        (product.complements?.reduce((sum, c) => sum + (c.price * c.quantity), 0) || 0)) * product.quantity;
    }

    try {
      const cartData = {
        products: updatedProducts,
        companyId: store._id,
        _id: cart._id,
      };

      const { data } = await apiService.post('/menu/estimateValue', cartData);
      onUpdateCart(data);
    } catch (error) {
      console.error('Erro ao atualizar carrinho:', error);
    }
  };

  const removeProduct = async (productIndex) => {
    const product = cart.products[productIndex];
    await updateProductQuantity(productIndex, -cart.products[productIndex].quantity);
    
    // Rastrear remoção do carrinho
    if (store?._id && trackCartEvent) {
      const updatedCartItems = cart.products
        .filter((_, idx) => idx !== productIndex)
        .map(p => ({
          productId: p.productId,
          productName: p.productName,
          quantity: p.quantity,
          variations: p.complements,
          price: p.price
        }));
      
      trackCartEvent('remove', product.productId, product.productName, product.complements, updatedCartItems);
    }
  };

  const handleDeliveryTypeChange = async (newType) => {
    setDeliveryType(newType);
    try {
      setLoading(true);
      const { data } = await apiService.post('/menu/delivery-type', {
        cartId: cart._id,
        deliveryType: newType,
      });
      onUpdateCart(data);
    } catch (error) {
      console.error('Erro ao atualizar tipo de entrega:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientDataSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.post('/menu/add-client-data', {
        cartId: cart._id,
        client: clientData,
      });
      onUpdateCart(data);
    } catch (error) {
      console.error('Erro ao salvar dados do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.post('/menu/calculateFreight', {
        cartId: cart._id,
        companyId: store._id,
        address: addressData,
      });
      onUpdateCart(data);
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      alert('Erro ao calcular frete. Verifique os dados do endereço.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOrder = async () => {
    if (!clientData.name || !clientData.phoneNumber) {
      alert('Por favor, preencha os dados do cliente');
      return;
    }

    if (deliveryType === 'delivery' && (!addressData.street || !addressData.number)) {
      alert('Por favor, preencha o endereço de entrega');
      return;
    }

    if (!paymentMethod) {
      setPaymentDialogOpen(true);
      return;
    }

    try {
      setLoading(true);
      const { data } = await apiService.post('/menu/finish', {
        cartId: cart._id,
        companyId: store._id,
        paymentType: paymentMethod.includes('pix') ? 'pix' : 'inDelivery',
        paymentMethod: paymentMethod,
        deliveryType: deliveryType,
      });

      if (data.success) {
        // Não rastrear como desistência se o pedido foi finalizado com sucesso
        alert('Pedido realizado com sucesso!');
        onClose();
        // Redirecionar para página de pedido ou limpar carrinho
        window.location.href = `/store/${store.storeUrl}/order/${data.order.id}`;
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart?.subtotal || 0;
  const deliveryFee = cart?.address?.price || 0;
  const total = cart?.total || subtotal;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: '400px', md: '500px' },
          }
        }}
      >
        <S.CartHeader $primaryColor={primaryColor}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            Carrinho
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </S.CartHeader>

        <S.CartContent>
          {!cart || !cart.products || cart.products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Seu carrinho está vazio
              </Typography>
            </Box>
          ) : (
            <>
              {/* Produtos */}
              <Box sx={{ mb: 3 }}>
                {cart.products.map((product, index) => (
                  <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {product.imageUrl && (
                        <Box
                          sx={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundImage: `url(${product.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {product.productName}
                        </Typography>
                        {product.complements && product.complements.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {product.complements.map(c => `${c.name} (${c.quantity}x)`).join(', ')}
                          </Typography>
                        )}
                        {product.comment && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                            Obs: {product.comment}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => updateProductQuantity(index, -1)}
                              sx={{ color: primaryColor }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2">{product.quantity}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => updateProductQuantity(index, 1)}
                              sx={{ color: primaryColor }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: primaryColor }}>
                              {product.priceTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeProduct(index)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Dados do Cliente */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Seus Dados
                </Typography>
                <TextField
                  fullWidth
                  label="Nome"
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  margin="dense"
                  required
                />
                <TextField
                  fullWidth
                  label="Telefone"
                  value={clientData.phoneNumber}
                  onChange={(e) => setClientData({ ...clientData, phoneNumber: e.target.value })}
                  margin="dense"
                  required
                />
                <TextField
                  fullWidth
                  label="Email (opcional)"
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  margin="dense"
                />
                <Button
                  variant="outlined"
                  onClick={handleClientDataSubmit}
                  sx={{ mt: 1, borderColor: primaryColor, color: primaryColor }}
                >
                  Salvar Dados
                </Button>
              </Box>

              {/* Tipo de Entrega */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Tipo de Entrega
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={deliveryType}
                    onChange={(e) => handleDeliveryTypeChange(e.target.value)}
                  >
                    {store.settingsDelivery?.allowStorePickup && (
                      <FormControlLabel
                        value="pickup"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label="Retirada na loja"
                      />
                    )}
                    {store.settingsDelivery?.delivery && (
                      <FormControlLabel
                        value="delivery"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label="Delivery"
                      />
                    )}
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Endereço (se delivery) */}
              {deliveryType === 'delivery' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Endereço de Entrega
                  </Typography>
                  <TextField
                    fullWidth
                    label="CEP"
                    value={addressData.zipCode}
                    onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="Rua"
                    value={addressData.street}
                    onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    margin="dense"
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Número"
                      value={addressData.number}
                      onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                      margin="dense"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Bairro"
                      value={addressData.district}
                      onChange={(e) => setAddressData({ ...addressData, district: e.target.value })}
                      margin="dense"
                      required
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Cidade"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    margin="dense"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Referência (opcional)"
                    value={addressData.reference}
                    onChange={(e) => setAddressData({ ...addressData, reference: e.target.value })}
                    margin="dense"
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddressSubmit}
                    sx={{ mt: 1, borderColor: primaryColor, color: primaryColor }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Calcular Frete'}
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Resumo */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                </Box>
                {deliveryType === 'delivery' && deliveryFee > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Taxa de entrega</Typography>
                    <Typography variant="body2">{deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: primaryColor }}>
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleFinishOrder}
                disabled={loading}
                sx={{
                  bgcolor: primaryColor,
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: primaryColor,
                    opacity: 0.9,
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Finalizar Pedido'}
              </Button>
            </>
          )}
        </S.CartContent>
      </Drawer>

      {/* Dialog de Pagamento */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Selecione a forma de pagamento</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {store.settingsPayment?.methods?.type?.map((method, index) => (
                <FormControlLabel
                  key={index}
                  value={method.id}
                  control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                  label={method.title}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              setPaymentDialogOpen(false);
              handleFinishOrder();
            }}
            variant="contained"
            sx={{ bgcolor: primaryColor }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Cart;

