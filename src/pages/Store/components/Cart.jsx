import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { CloseIcon, DeleteIcon, AddIcon, RemoveIcon, ShoppingBagIcon, LocalShippingIcon, StoreIcon, PaymentIcon, PersonIcon, LocationOnIcon, WhatsAppIcon } from 'components/icons';
import { useTranslation } from 'react-i18next';
import BackdropLoading from 'components/BackdropLoading';
import * as S from './Cart.style';

const Cart = ({ open, onClose, cart, store, onUpdateCart, apiService, primaryColor, secondaryColor, trackCartEvent }) => {
  const { t } = useTranslation('store');
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
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [hasAvailableCoupons, setHasAvailableCoupons] = useState(false);
  const [showCouponField, setShowCouponField] = useState(false);
  const [checkingCoupons, setCheckingCoupons] = useState(false);

  // Verificar se há cupons disponíveis
  useEffect(() => {
    const checkCoupons = async () => {
      if (!store?._id || checkingCoupons) return;
      
      try {
        setCheckingCoupons(true);
        const { data } = await apiService.get(`/menu/check-coupons?companyId=${store._id}`);
        if (data && data.success) {
          setHasAvailableCoupons(data.hasAvailableCoupons || false);
          // Se já tem cupom aplicado, mostrar o campo
          if (cart?.coupon?.code) {
            setShowCouponField(true);
          }
        } else {
          // Se a resposta não foi bem-sucedida, ainda verificar se tem cupom aplicado
          if (cart?.coupon?.code) {
            setHasAvailableCoupons(true);
            setShowCouponField(true);
          } else {
            setHasAvailableCoupons(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar cupons:', error);
        console.error('Detalhes do erro:', error.response?.data);
        // Em caso de erro, ainda mostrar se já tem cupom aplicado
        // Ou permitir que o usuário tente inserir um cupom (pode haver cupons mesmo se a verificação falhar)
        if (cart?.coupon?.code) {
          setHasAvailableCoupons(true);
          setShowCouponField(true);
        } else {
          // Permitir tentar inserir cupom mesmo se a verificação falhar
          // A validação será feita ao aplicar
          setHasAvailableCoupons(true);
        }
      } finally {
        setCheckingCoupons(false);
      }
    };

    if (store?._id && open) {
      checkCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?._id, open]);

  // Inicializar dados do carrinho apenas uma vez quando o carrinho muda
  useEffect(() => {
    if (cart?.client && (!clientData.name || !clientData.phoneNumber)) {
      setClientData(cart.client);
    }
    if (cart?.deliveryType && deliveryType !== cart.deliveryType) {
      setDeliveryType(cart.deliveryType);
    }
    if (cart?.address && (!addressData.street || !addressData.number)) {
      setAddressData(prev => ({ ...prev, ...cart.address }));
    }
    if (cart?.coupon?.code && !couponCode) {
      setCouponCode(cart.coupon.code);
      setShowCouponField(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?._id]);

  // Rastrear abertura do carrinho - memoizar cartItems para evitar recriação
  const cartItems = useMemo(() => {
    if (!cart?.products) return [];
    return cart.products.map(p => ({
      productId: p.productId,
      productName: p.productName,
      quantity: p.quantity,
      variations: p.complements,
      price: p.price
    }));
  }, [cart?.products]);

  useEffect(() => {
    if (open && store?._id && cartItems.length > 0 && trackCartEvent) {
      trackCartEvent('open', null, null, null, cartItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, store?._id, cartItems.length]);

  // Salvar dados do cliente automaticamente quando preenchidos - otimizado com debounce maior
  useEffect(() => {
    if (!clientData.name || !clientData.phoneNumber || !cart?._id || savingClientData) {
      return;
    }

    // Aguardar mais tempo para evitar muitas requisições (debounce de 1.5s)
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
    }, 1500); // Aguardar 1.5 segundos após parar de digitar

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientData.name, clientData.phoneNumber, cart?._id]);

  const updateProductQuantity = useCallback(async (productIndex, delta) => {
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
  }, [cart, store?._id, apiService, onUpdateCart]);

  const removeProduct = useCallback(async (productIndex) => {
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
  }, [cart, updateProductQuantity, store?._id, trackCartEvent]);

  const handleDeliveryTypeChange = useCallback(async (newType) => {
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
  }, [cart?._id, apiService, onUpdateCart]);

  const handleAddressSubmit = useCallback(async () => {
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
      alert(t('cart.calculateFreightError'));
    } finally {
      setSavingAddress(false);
    }
  }, [store?.settingsDelivery?.deliveryOption, store?.settingsDelivery?.kmValue, store?._id, cart?._id, addressData, apiService, onUpdateCart, t]);

  // Calcular frete automaticamente quando for fixed - otimizado com debounce maior
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
      }, 1500); // Aumentado para 1.5s para reduzir requisições

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryType, addressData.street, addressData.number, addressData.district, addressData.city, store?.settingsDelivery?.deliveryOption, cart?._id]);

  const handleFinishOrder = async () => {
    // Validações
    if (!clientData.name || !clientData.phoneNumber) {
      alert(t('cart.fillClientData'));
      return;
    }

    if (deliveryType === 'delivery' && (!addressData.street || !addressData.number || !addressData.district || !addressData.city)) {
      alert(t('cart.fillAddressData'));
      return;
    }

    if (!paymentMethod) {
      alert(t('cart.selectPaymentMethod'));
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
        // Limpar carrinho do localStorage
        if (store?._id) {
          localStorage.removeItem(`cart_${store._id}`);
        }
        
        // Abrir WhatsApp com a mensagem formatada
        window.open(data.whatsappLink, '_blank');
        
        // Redirecionar para página de confirmação
        onClose();
        window.location.href = `/store/${store.storeUrl}/order/${data.order.id}?confirm=true`;
      } else if (data.success) {
        // Limpar carrinho do localStorage
        if (store?._id) {
          localStorage.removeItem(`cart_${store._id}`);
        }
        
        // Caso não tenha WhatsApp cadastrado, apenas redirecionar
        alert(t('cart.orderSuccess'));
        onClose();
        window.location.href = `/store/${store.storeUrl}/order/${data.order.id}`;
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert(t('cart.orderError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim() || !cart?._id || !store?._id) {
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponError('');
      const { data } = await apiService.post('/menu/apply-coupon', {
        cartId: cart._id,
        companyId: store._id,
        couponCode: couponCode.trim(),
      });

      if (data.success) {
        onUpdateCart(data);
        setCouponError('');
      } else {
        setCouponError(data.message || t('cart.couponError'));
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      setCouponError(error.response?.data?.message || t('cart.couponError'));
    } finally {
      setApplyingCoupon(false);
    }
  }, [couponCode, cart?._id, store?._id, apiService, onUpdateCart, t]);

  const handleRemoveCoupon = useCallback(async () => {
    if (!cart?._id) {
      return;
    }

    try {
      setApplyingCoupon(true);
      const { data } = await apiService.post('/menu/remove-coupon', {
        cartId: cart._id,
      });

      if (data.success) {
        onUpdateCart(data);
        setCouponCode('');
        setCouponError('');
      }
    } catch (error) {
      console.error('Erro ao remover cupom:', error);
    } finally {
      setApplyingCoupon(false);
    }
  }, [cart?._id, apiService, onUpdateCart]);

  // Memoizar cálculos para evitar recálculos desnecessários
  const subtotal = useMemo(() => cart?.subtotal || 0, [cart?.subtotal]);
  const deliveryFee = useMemo(() => cart?.address?.price || 0, [cart?.address?.price]);
  const couponDiscount = useMemo(() => cart?.coupon?.discountAmount || 0, [cart?.coupon?.discountAmount]);
  const total = useMemo(() => cart?.total || subtotal, [cart?.total, subtotal]);
  const paymentMethods = useMemo(() => store?.settingsPayment?.methods?.type || [], [store?.settingsPayment?.methods?.type]);
  const totalItemsCount = useMemo(() => cart?.products?.reduce((sum, p) => sum + p.quantity, 0) || 0, [cart?.products]);

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
          <ShoppingBagIcon />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            {t('cart.title')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </S.CartHeader>

      <S.CartContent>
        {!cart || !cart.products || cart.products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBagIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t('cart.empty')}
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Produtos */}
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('cart.items')} ({cart.products.length})
                  </Typography>
                  <Chip 
                    label={totalItemsCount} 
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
                            {t('product.comment')}: {product.comment}
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
                    {t('cart.clientInfo')}
                  </Typography>
                  {savingClientData && (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  )}
                </Box>
                <TextField
                  fullWidth
                  label={`${t('cart.name')} *`}
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  margin="dense"
                  required
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label={`${t('cart.phone')} *`}
                  value={clientData.phoneNumber}
                  onChange={(e) => setClientData({ ...clientData, phoneNumber: e.target.value })}
                  margin="dense"
                  required
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label={`${t('cart.email')} (${t('product.optional')})`}
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
                    {t('cart.deliveryType')}
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
                            <Typography>{t('cart.pickup')}</Typography>
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
                            <Typography>{t('cart.delivery')}</Typography>
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
                        {t('cart.address')} {t('cart.delivery')}
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      label={t('cart.zipCode')}
                      value={addressData.zipCode}
                      onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                      margin="dense"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label={`${t('cart.street')} *`}
                      value={addressData.street}
                      onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                      margin="dense"
                      required
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        label={`${t('cart.number')} *`}
                        value={addressData.number}
                        onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                        margin="dense"
                        required
                      />
                      <TextField
                        fullWidth
                        label={`${t('cart.district')} *`}
                        value={addressData.district}
                        onChange={(e) => setAddressData({ ...addressData, district: e.target.value })}
                        margin="dense"
                        required
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label={`${t('cart.city')} *`}
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      margin="dense"
                      required
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label={`${t('cart.reference')} (${t('product.optional')})`}
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
                        {savingAddress ? <CircularProgress size={20} /> : t('cart.calculateFreight')}
                      </Button>
                    )}

                    {/* Mostrar taxa de entrega baseada na configuração */}
                    {store?.settingsDelivery?.deliveryOption === 'fixed' && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('cart.deliveryFee')}: {
                            store.settingsDelivery.fixedValue > 0 
                              ? store.settingsDelivery.fixedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : t('cart.free')
                          }
                        </Typography>
                      </Box>
                    )}

                    {store?.settingsDelivery?.deliveryOption === 'customerPickup' && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('cart.deliveryFee')}: {t('cart.toArrange')}
                        </Typography>
                      </Box>
                    )}

                    {store?.settingsDelivery?.deliveryOption === 'automatic' && deliveryFee > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        {t('cart.deliveryFee')}: {deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                    {t('cart.paymentMethod')}
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
                    {t('cart.noPaymentMethod')}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Cupom de Desconto - Só aparece se houver cupons disponíveis ou se já tiver cupom aplicado */}
            {(hasAvailableCoupons || cart?.coupon?.code) && (
              <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  {cart?.coupon?.code ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: '#e8f5e9',
                      borderRadius: 1,
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#00a859', fontSize: '0.875rem' }}>
                          {t('cart.couponApplied')}: {cart.coupon.code}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {t('cart.discount')}: {couponDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={handleRemoveCoupon}
                        disabled={applyingCoupon}
                        sx={{ 
                          color: 'error.main',
                          minWidth: 'auto',
                          px: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {t('cart.removeCoupon')}
                      </Button>
                    </Box>
                  ) : (
                    <>
                      {!showCouponField ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            {t('cart.haveCoupon')}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => setShowCouponField(true)}
                            sx={{ 
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              color: primaryColor,
                              minWidth: 'auto',
                              px: 1
                            }}
                          >
                            {t('cart.applyCoupon')}
                          </Button>
                        </Box>
                      ) : (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                              {t('cart.coupon')}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => {
                                setShowCouponField(false);
                                setCouponCode('');
                                setCouponError('');
                              }}
                              sx={{ 
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                                minWidth: 'auto',
                                px: 0.5
                              }}
                            >
                              Fechar
                            </Button>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <TextField
                              fullWidth
                              label={t('cart.couponCode')}
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError('');
                              }}
                              margin="dense"
                              error={!!couponError}
                              helperText={couponError}
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <Button
                              variant="outlined"
                              onClick={handleApplyCoupon}
                              disabled={applyingCoupon || !couponCode.trim()}
                              size="small"
                              sx={{ 
                                mt: '8px',
                                height: '40px',
                                minWidth: '80px',
                                borderColor: primaryColor,
                                color: primaryColor,
                                '&:hover': {
                                  borderColor: primaryColor,
                                  bgcolor: `${primaryColor}10`,
                                },
                              }}
                            >
                              {applyingCoupon ? <CircularProgress size={16} /> : t('cart.applyCoupon')}
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resumo */}
            <Card sx={{ mb: 2, borderRadius: 2, bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t('cart.subtotal')}</Typography>
                    <Typography variant="body2">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                  </Box>
                  {deliveryType === 'delivery' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{t('cart.deliveryFee')}</Typography>
                      <Typography variant="body2">
                        {store?.settingsDelivery?.deliveryOption === 'customerPickup' 
                          ? t('cart.toArrange')
                          : store?.settingsDelivery?.deliveryOption === 'fixed'
                          ? (store.settingsDelivery.fixedValue > 0 
                              ? store.settingsDelivery.fixedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : t('cart.free'))
                          : deliveryFee > 0
                          ? deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : t('cart.calculating')}
                      </Typography>
                    </Box>
                  )}
                  {couponDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'success.main' }}>
                        {t('cart.discount')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main' }}>
                        - {couponDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {t('cart.total')}
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
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : t('cart.finishOrder')}
            </Button>
          </Box>
        )}
      </S.CartContent>
      <BackdropLoading loading={loading} />
    </Drawer>
  );
};

export default Cart;
