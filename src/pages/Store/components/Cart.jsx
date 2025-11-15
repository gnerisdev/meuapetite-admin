import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CloseIcon, DeleteIcon, AddIcon, RemoveIcon, ShoppingCartIcon, LocalShippingIcon, StoreIcon, PaymentIcon, PersonIcon, LocationOnIcon, WhatsAppIcon } from 'components/icons';
import * as S from './Cart.style';

const Cart = ({ open, onClose, cart, store, onUpdateCart, apiService, primaryColor, secondaryColor, trackCartEvent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [paymentMethod, setPaymentMethod] = useState('');
  const [savingClientData, setSavingClientData] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (cart?.client) {
      setClientData(cart.client);
    }
    if (cart?.deliveryType) {
      setDeliveryType(cart.deliveryType);
    }
    if (cart?.address) {
      setAddressData(prev => ({ ...prev, ...cart.address }));
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

  // Salvar dados do cliente automaticamente quando preenchidos
  useEffect(() => {
    if (!clientData.name || !clientData.phoneNumber || !cart?._id || savingClientData) {
      return;
    }

    // Aguardar um pouco para evitar muitas requisições
    const timeoutId = setTimeout(async () => {
      try {
        setSavingClientData(true);
        const { data } = await apiService.post('/menu/add-client-data', {
          cartId: cart._id,
          client: clientData,
        });
        onUpdateCart(data);
      } catch (error) {
        console.error('Erro ao salvar dados do cliente:', error);
      } finally {
        setSavingClientData(false);
      }
    }, 1000); // Aguardar 1 segundo após parar de digitar

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientData.name, clientData.phoneNumber, cart?._id]);

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

  const handleAddressSubmit = async () => {
    // Só calcular se for automático e tiver kmValue
    if (store?.settingsDelivery?.deliveryOption !== 'automatic' || !store?.settingsDelivery?.kmValue) {
      return;
    }

    try {
      setSavingAddress(true);
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
      setSavingAddress(false);
    }
  };

  // Calcular frete automaticamente quando for fixed
  useEffect(() => {
    if (
      deliveryType === 'delivery' && 
      store?.settingsDelivery?.deliveryOption === 'fixed' &&
      addressData.street && 
      addressData.number && 
      addressData.district && 
      addressData.city &&
      cart?._id &&
      !savingAddress
    ) {
      const timeoutId = setTimeout(async () => {
        try {
          setSavingAddress(true);
          const { data } = await apiService.post('/menu/calculateFreight', {
            cartId: cart._id,
            companyId: store._id,
            address: addressData,
          });
          onUpdateCart(data);
        } catch (error) {
          console.error('Erro ao calcular frete fixo:', error);
        } finally {
          setSavingAddress(false);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryType, addressData.street, addressData.number, addressData.district, addressData.city, store?.settingsDelivery?.deliveryOption, cart?._id]);

  const handleFinishOrder = async () => {
    // Validações
    if (!clientData.name || !clientData.phoneNumber) {
      alert('Por favor, preencha os dados do cliente (nome e telefone são obrigatórios)');
      return;
    }

    if (deliveryType === 'delivery' && (!addressData.street || !addressData.number || !addressData.district || !addressData.city)) {
      alert('Por favor, preencha todos os dados do endereço de entrega');
      return;
    }

    if (!paymentMethod) {
      alert('Por favor, selecione uma forma de pagamento');
      return;
    }

    // Garantir que os dados do cliente estão salvos
    try {
      await apiService.post('/menu/add-client-data', {
        cartId: cart._id,
        client: clientData,
      });
    } catch (error) {
      console.error('Erro ao salvar dados do cliente antes de finalizar:', error);
    }

    // Se for delivery, garantir que o endereço está salvo
    if (deliveryType === 'delivery') {
      try {
        await apiService.post('/menu/calculateFreight', {
          cartId: cart._id,
          companyId: store._id,
          address: addressData,
        });
      } catch (error) {
        console.error('Erro ao salvar endereço antes de finalizar:', error);
      }
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

      if (data.success && data.whatsappLink && data.companyWhatsapp) {
        // Abrir WhatsApp com a mensagem formatada
        window.open(data.whatsappLink, '_blank');
        
        // Redirecionar para página de confirmação
        onClose();
        window.location.href = `/store/${store.storeUrl}/order/${data.order.id}?confirm=true`;
      } else if (data.success) {
        // Caso não tenha WhatsApp cadastrado, apenas redirecionar
        alert('Pedido realizado com sucesso!');
        onClose();
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

  const paymentMethods = store?.settingsPayment?.methods?.type || [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '100%', md: '500px' },
          maxWidth: { md: '500px' },
          height: { xs: '100%', sm: '100%' },
        }
      }}
    >
      <S.CartHeader $primaryColor={primaryColor}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            Carrinho
          </Typography>
        </Box>
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
          <Box>
            {/* Produtos */}
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Itens ({cart.products.length})
                  </Typography>
                  <Chip 
                    label={cart.products.reduce((sum, p) => sum + p.quantity, 0)} 
                    size="small" 
                    sx={{ bgcolor: primaryColor, color: '#fff' }}
                  />
                </Box>
                {cart.products.map((product, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2, 
                      pb: 2, 
                      borderBottom: index < cart.products.length - 1 ? '1px solid #e0e0e0' : 'none',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateX(4px)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {product.imageUrl && (
                        <Box
                          sx={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundImage: `url(${product.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxShadow: 2,
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
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', mb: 0.5 }}>
                            Obs: {product.comment}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `1px solid ${primaryColor}`, borderRadius: '8px', padding: '2px' }}>
                            <IconButton
                              size="small"
                              onClick={() => updateProductQuantity(index, -1)}
                              sx={{ color: primaryColor }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: '24px', textAlign: 'center' }}>
                              {product.quantity}
                            </Typography>
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
              </CardContent>
            </Card>

            {/* Dados do Cliente */}
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ color: primaryColor }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Seus Dados
                  </Typography>
                  {savingClientData && (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Nome *"
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  margin="dense"
                  required
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Telefone *"
                  value={clientData.phoneNumber}
                  onChange={(e) => setClientData({ ...clientData, phoneNumber: e.target.value })}
                  margin="dense"
                  required
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Email (opcional)"
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  margin="dense"
                />
              </CardContent>
            </Card>

            {/* Tipo de Entrega */}
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {deliveryType === 'pickup' ? (
                    <StoreIcon sx={{ color: primaryColor }} />
                  ) : (
                    <LocalShippingIcon sx={{ color: primaryColor }} />
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Entrega
                  </Typography>
                </Box>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={deliveryType}
                    onChange={(e) => handleDeliveryTypeChange(e.target.value)}
                  >
                    {store.settingsDelivery?.allowStorePickup && (
                      <FormControlLabel
                        value="pickup"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StoreIcon />
                            <Typography>Retirada na loja</Typography>
                          </Box>
                        }
                      />
                    )}
                    {store.settingsDelivery?.delivery && (
                      <FormControlLabel
                        value="delivery"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShippingIcon />
                            <Typography>Delivery</Typography>
                          </Box>
                        }
                      />
                    )}
                  </RadioGroup>
                </FormControl>

                {/* Endereço (se delivery) */}
                {deliveryType === 'delivery' && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: primaryColor }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Endereço de Entrega
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      label="CEP"
                      value={addressData.zipCode}
                      onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                      margin="dense"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Rua *"
                      value={addressData.street}
                      onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                      margin="dense"
                      required
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        label="Número *"
                        value={addressData.number}
                        onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                        margin="dense"
                        required
                      />
                      <TextField
                        fullWidth
                        label="Bairro *"
                        value={addressData.district}
                        onChange={(e) => setAddressData({ ...addressData, district: e.target.value })}
                        margin="dense"
                        required
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Cidade *"
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      margin="dense"
                      required
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Referência (opcional)"
                      value={addressData.reference}
                      onChange={(e) => setAddressData({ ...addressData, reference: e.target.value })}
                      margin="dense"
                      multiline
                      rows={2}
                      sx={{ mb: 1 }}
                    />
                    
                    {/* Botão de calcular frete apenas se for automático e tiver kmValue */}
                    {store?.settingsDelivery?.deliveryOption === 'automatic' && 
                     store?.settingsDelivery?.kmValue > 0 && (
                      <Button
                        variant="contained"
                        onClick={handleAddressSubmit}
                        sx={{ 
                          mt: 1, 
                          bgcolor: primaryColor,
                          '&:hover': { bgcolor: primaryColor, opacity: 0.9 }
                        }}
                        disabled={savingAddress || !addressData.street || !addressData.number || !addressData.district || !addressData.city}
                        fullWidth
                      >
                        {savingAddress ? <CircularProgress size={20} /> : 'Calcular Frete'}
                      </Button>
                    )}

                    {/* Mostrar taxa de entrega baseada na configuração */}
                    {store?.settingsDelivery?.deliveryOption === 'fixed' && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Taxa de entrega: {
                            store.settingsDelivery.fixedValue > 0 
                              ? store.settingsDelivery.fixedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : 'Grátis'
                          }
                        </Typography>
                      </Box>
                    )}

                    {store?.settingsDelivery?.deliveryOption === 'customerPickup' && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Taxa de entrega: À combinar com a loja
                        </Typography>
                      </Box>
                    )}

                    {store?.settingsDelivery?.deliveryOption === 'automatic' && deliveryFee > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        Taxa de entrega: {deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PaymentIcon sx={{ color: primaryColor }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Forma de Pagamento
                  </Typography>
                </Box>
                {paymentMethods.length > 0 ? (
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      {paymentMethods.map((method, index) => (
                        <FormControlLabel
                          key={index}
                          value={method.id}
                          control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {method.image && (
                                <Box
                                  component="img"
                                  src={method.image}
                                  alt={method.title}
                                  sx={{ width: 32, height: 32, objectFit: 'contain' }}
                                />
                              )}
                              <Typography>{method.title}</Typography>
                            </Box>
                          }
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma forma de pagamento disponível
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card sx={{ mb: 2, borderRadius: 2, bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal</Typography>
                    <Typography variant="body2">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                  </Box>
                  {deliveryType === 'delivery' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Taxa de entrega</Typography>
                      <Typography variant="body2">
                        {store?.settingsDelivery?.deliveryOption === 'customerPickup' 
                          ? 'À combinar'
                          : store?.settingsDelivery?.deliveryOption === 'fixed'
                          ? (store.settingsDelivery.fixedValue > 0 
                              ? store.settingsDelivery.fixedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : 'Grátis')
                          : deliveryFee > 0
                          ? deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : 'Calculando...'}
                      </Typography>
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
              </CardContent>
            </Card>

            {/* Botão Finalizar */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleFinishOrder}
              disabled={loading}
              sx={{
                bgcolor: primaryColor,
                color: '#fff',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: 3,
                '&:hover': {
                  bgcolor: primaryColor,
                  opacity: 0.9,
                  boxShadow: 4,
                },
                '&:disabled': {
                  bgcolor: '#ccc',
                },
              }}
              startIcon={<WhatsAppIcon />}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Finalizar Pedido'}
            </Button>
          </Box>
        )}
      </S.CartContent>
    </Drawer>
  );
};

export default Cart;
