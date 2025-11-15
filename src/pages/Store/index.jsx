import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Badge,
  Button,
} from '@mui/material';
import { ShoppingCartIcon, CheckCircleIcon, CancelIcon, InfoIcon, AccessTimeIcon } from 'components/icons';
import { ApiService } from 'services/api.service';
import { useVisitorTracking } from 'hooks/useVisitorTracking';
import { useTranslation } from 'react-i18next';
import { useI18n } from 'contexts/I18nContext';
import LanguageSelector from 'components/LanguageSelector';
import ProductModal from './components/ProductModal';
import Cart from './components/Cart';
import StoreInfoModal from './components/StoreInfoModal';
import OrderConfirmation from './components/OrderConfirmation';
import * as S from './style';

const Store = () => {
  const { slug, orderId } = useParams();
  const { storeLanguage } = useI18n();
  const { t, i18n } = useTranslation('store');
  const apiService = new ApiService(false); // Não autenticado
  
  // Obter idioma preferido do usuário ou usar o padrão do admin
  const getUserStoreLanguage = () => {
    const userLanguage = localStorage.getItem('storeUserLanguage');
    return userLanguage || storeLanguage || 'pt-BR';
  };

  const [currentStoreLanguage, setCurrentStoreLanguage] = useState(getUserStoreLanguage());
  
  // Mudar idioma da loja quando storeLanguage (padrão do admin) ou preferência do usuário mudar
  useEffect(() => {
    const userLanguage = localStorage.getItem('storeUserLanguage');
    const langToUse = userLanguage || storeLanguage || 'pt-BR';
    setCurrentStoreLanguage(langToUse);
    i18n.changeLanguage(langToUse);
    i18n.loadNamespaces('store');
  }, [storeLanguage, i18n]);

  // Escutar mudanças no idioma quando o usuário mudar
  useEffect(() => {
    const handleLanguageChange = (e) => {
      const newLang = e.language || localStorage.getItem('storeUserLanguage') || storeLanguage || 'pt-BR';
      setCurrentStoreLanguage(newLang);
      i18n.changeLanguage(newLang);
      i18n.loadNamespaces('store');
    };
    
    // Escutar eventos customizados (mesma aba)
    window.addEventListener('storeLanguageChanged', handleLanguageChange);
    // Escutar eventos de storage (outras abas)
    const handleStorageChange = (e) => {
      if (e.key === 'storeUserLanguage') {
        const newLang = e.newValue || storeLanguage || 'pt-BR';
        setCurrentStoreLanguage(newLang);
        i18n.changeLanguage(newLang);
        i18n.loadNamespaces('store');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storeLanguageChanged', handleLanguageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storeLanguage, i18n]);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Inicializar rastreamento de visitantes
  const { trackPageView, trackCartEvent } = useVisitorTracking(store?._id);

  useEffect(() => {
    fetchStoreData();
    fetchProducts();
  }, [slug]);

  // Rastrear visualização da página quando a loja carregar
  useEffect(() => {
    if (store?._id) {
      trackPageView('store', null, store.fantasyName);
    }
  }, [store?._id, trackPageView]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.get(`/menu/${slug}`);
      if (data.success === false) {
        console.error('Loja não encontrada');
        return;
      }
      setStore(data);
    } catch (error) {
      console.error('Erro ao buscar dados da loja:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await apiService.get(`/menu/products/${slug}`);
      setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    // Rastrear visualização de produto
    if (store?._id) {
      trackPageView('product', product._id, product.name);
    }
  };

  const handleAddToCart = async (productData) => {
    try {
      if (!store || !store._id) {
        console.error('Loja não encontrada');
        return;
      }

      const cartData = {
        products: [productData],
        companyId: store._id,
        _id: cart?._id,
      };

      const { data } = await apiService.post('/menu/estimateValue', cartData);
      setCart(data);
      setCartItemsCount(data.products?.reduce((sum, p) => sum + p.quantity, 0) || 0);
      
      // Rastrear adição ao carrinho
      if (store?._id) {
        const cartItems = data.products?.map(p => ({
          productId: p.productId,
          productName: p.productName,
          quantity: p.quantity,
          variations: p.complements,
          price: p.price
        })) || [];
        
        trackCartEvent('add', productData.productId, productData.productName, productData.complements, cartItems);
      }
      
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    setCartItemsCount(updatedCart?.products?.reduce((sum, p) => sum + p.quantity, 0) || 0);
  };

  const getTodayOpeningHours = () => {
    if (!store?.settings?.openingHours) return null;
    
    const time = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = [
      t('store.sunday'),
      t('store.monday'),
      t('store.tuesday'),
      t('store.wednesday'),
      t('store.thursday'),
      t('store.friday'),
      t('store.saturday')
    ];
    const today = days[time.getDay()];
    const todayName = dayNames[time.getDay()];
    const hours = store.settings.openingHours[today];
    
    if (!hours) return null;
    
    let text = '';
    if (hours.alwaysClosed) {
      text = t('store.closed');
    } else if (hours.alwaysOpen) {
      text = t('store.open24h');
    } else {
      text = `${hours.open} - ${hours.close}`;
    }
    
    return { day: todayName, text };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!store) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5">{t('store.notFound')}</Typography>
        <Typography variant="body2" color="text.secondary">{t('store.notFoundDescription')}</Typography>
      </Box>
    );
  }

  const primaryColor = store.custom?.colorPrimary || '#800080';
  const secondaryColor = store.custom?.colorSecondary || '#00FF00';

  // Se houver orderId na URL, exibir página de confirmação
  if (orderId) {
    return <OrderConfirmation />;
  }

  return (
    <S.StoreContainer $primaryColor={primaryColor} $secondaryColor={secondaryColor}>
      {/* Header */}
      <S.StoreHeader>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {store.custom?.logo?.url && (
                <Box sx={{ 
                  width: { xs: '60px', sm: '80px' }, 
                  height: { xs: '60px', sm: '80px' },
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  <img 
                    src={store.custom.logo.url} 
                    alt={store.fantasyName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              )}
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1a1a1a', 
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    mb: 0.5,
                  }}
                >
                  {store.fantasyName}
                </Typography>
                {store.description && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666666', 
                      fontSize: '0.875rem',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {store.description}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {/* Seletor de Idioma */}
              <LanguageSelector forStore={true} />
              
              {/* Status e Horário */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={store.isOpen ? <CheckCircleIcon sx={{ color: '#00a859 !important' }} /> : <CancelIcon />}
                  label={store.isOpen ? t('store.open') || 'Aberto' : t('store.closed')}
                  sx={{
                    bgcolor: store.isOpen ? '#e8f5e9' : '#ffebee',
                    color: store.isOpen ? '#00a859' : '#c62828',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    height: '32px',
                    '& .MuiChip-icon': {
                      color: 'inherit',
                    },
                  }}
                />
                {getTodayOpeningHours() && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    color: '#666666',
                    fontSize: '0.875rem',
                  }}>
                    <AccessTimeIcon sx={{ fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 400 }}>
                      {getTodayOpeningHours().text}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Botão Ver Informações */}
              <Button
                variant="text"
                startIcon={<InfoIcon />}
                onClick={() => setInfoModalOpen(true)}
                sx={{
                  color: '#666666',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  padding: '6px 12px',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
              >
                {t('store.info')}
              </Button>
            </Box>
          </Box>
        </Box>
      </S.StoreHeader>

      {/* Produtos por categoria */}
      <S.ProductsSection>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: { xs: '16px', sm: '24px' } }}>
          {products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666666', fontWeight: 400 }}>
                Nenhum produto disponível no momento
              </Typography>
            </Box>
          ) : (
            products.map((category, categoryIndex) => (
              <Box key={categoryIndex} sx={{ mb: { xs: 5, sm: 6 } }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: { xs: 2, sm: 3 },
                    color: '#1a1a1a',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    pb: 1,
                    borderBottom: '2px solid #f0f0f0',
                    textTransform: 'capitalize',
                  }}
                >
                  {category.title}
                </Typography>
                <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
                  {category.products?.map((product, productIndex) => (
                    <Grid item xs={6} sm={6} md={4} lg={3} key={productIndex}>
                      <S.ProductCard 
                        onClick={() => handleProductClick(product)}
                        $primaryColor={primaryColor}
                      >
                        {product.images?.[0]?.url && (
                          <S.ProductImageContainer>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${product.images[0].url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                              className="product-image-bg"
                            />
                            <S.ProductOverlay className="product-overlay" />
                          </S.ProductImageContainer>
                        )}
                        <S.ProductCardContent className="product-content">
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.9375rem',
                              lineHeight: 1.4,
                              color: '#1a1a1a',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              minHeight: '40px',
                              mb: 0.5,
                            }}
                          >
                            {product.name}
                          </Typography>
                          {product.description && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.8125rem',
                                lineHeight: 1.5,
                                color: '#666666',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                minHeight: '36px',
                                mb: 1,
                              }}
                            >
                              {product.description}
                            </Typography>
                          )}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            mt: 'auto',
                            pt: 1,
                            borderTop: '1px solid #f5f5f5',
                          }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              {product.priceDiscount && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    textDecoration: 'line-through',
                                    color: '#999999',
                                    fontSize: '0.75rem',
                                    fontWeight: 400,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                              )}
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: '#1a1a1a',
                                  fontSize: '1.125rem',
                                  lineHeight: 1.2,
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                {product.priceDiscount 
                                  ? product.priceDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                  : product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                }
                              </Typography>
                            </Box>
                            {product.priceDiscount && (
                              <Box
                                sx={{
                                  bgcolor: '#ea1d2c',
                                  color: '#fff',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {Math.round(((product.price - product.priceDiscount) / product.price) * 100)}% OFF
                              </Box>
                            )}
                          </Box>
                        </S.ProductCardContent>
                      </S.ProductCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}
        </Box>
      </S.ProductsSection>

      {/* Botão do carrinho flutuante */}
      {cartItemsCount > 0 && (
        <Box
          onClick={() => setCartOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: '#ea1d2c',
            color: '#fff',
            borderRadius: '28px',
            padding: '12px 24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: '200px',
            justifyContent: 'center',
            '&:hover': {
              bgcolor: '#d41a28',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Badge badgeContent={cartItemsCount} color="error" sx={{ '& .MuiBadge-badge': { bgcolor: '#fff', color: '#ea1d2c' } }}>
            <ShoppingCartIcon />
          </Badge>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
            Ver carrinho
          </Typography>
        </Box>
      )}

      {/* Modal de produto */}
      <ProductModal
        open={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      {/* Carrinho */}
      <Cart
        open={cartOpen}
        onClose={() => {
          // Rastrear fechamento do carrinho
          if (store?._id && cart?.products?.length > 0) {
            const cartItems = cart.products.map(p => ({
              productId: p.productId,
              productName: p.productName,
              quantity: p.quantity,
              variations: p.complements,
              price: p.price
            }));
            trackCartEvent('close', null, null, null, cartItems);
          }
          setCartOpen(false);
        }}
        cart={cart}
        store={store}
        onUpdateCart={updateCart}
        apiService={apiService}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        trackCartEvent={trackCartEvent}
      />

      {/* Modal de Informações */}
      <StoreInfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        store={store}
        primaryColor={primaryColor}
      />
    </S.StoreContainer>
  );
};

export default Store;

