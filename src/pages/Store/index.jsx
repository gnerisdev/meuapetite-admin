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
  IconButton,
} from '@mui/material';
import { ShoppingBagIcon, CheckCircleIcon, CancelIcon, InfoIcon, AccessTimeIcon, WhatsAppIcon } from 'components/icons';
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

  // Carregar carrinho do localStorage quando a loja carregar
  useEffect(() => {
    if (store?._id) {
      const savedCart = localStorage.getItem(`cart_${store._id}`);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          setCartItemsCount(parsedCart.products?.reduce((sum, p) => sum + p.quantity, 0) || 0);
        } catch (error) {
          console.error('Erro ao carregar carrinho do localStorage:', error);
        }
      }
    }
  }, [store?._id]);

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

      // Mesclar produtos existentes com o novo produto
      const existingProducts = cart?.products || [];
      
      // Verificar se já existe um produto igual (mesmo ID e mesmos complements)
      const productKey = (p) => {
        const complementsKey = p.complements?.map(c => `${c.id}-${c.quantity}`).sort().join(',') || '';
        return `${p.productId}-${complementsKey}-${p.comment || ''}`;
      };
      
      const newProductKey = productKey(productData);
      let updatedProducts = [...existingProducts];
      
      const existingIndex = updatedProducts.findIndex(p => productKey(p) === newProductKey);
      
      if (existingIndex >= 0) {
        // Se já existe, incrementa a quantidade
        updatedProducts[existingIndex].quantity += productData.quantity;
      } else {
        // Se não existe, adiciona como novo item
        updatedProducts.push(productData);
      }

      const cartData = {
        products: updatedProducts,
        companyId: store._id,
        _id: cart?._id,
      };

      const { data } = await apiService.post('/menu/estimateValue', cartData);
      setCart(data);
      setCartItemsCount(data.products?.reduce((sum, p) => sum + p.quantity, 0) || 0);
      
      // Salvar carrinho no localStorage
      if (store?._id && data) {
        localStorage.setItem(`cart_${store._id}`, JSON.stringify(data));
      }
      
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
    
    // Salvar carrinho atualizado no localStorage
    if (store?._id && updatedCart) {
      localStorage.setItem(`cart_${store._id}`, JSON.stringify(updatedCart));
    }
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
        {/* Banner no topo */}
        {store.custom?.backgroundImage?.url && (
          <S.StoreBanner>
            <Box
              sx={{
                width: '100%',
                height: { xs: '300px', sm: '300px', md: '400px' },
                backgroundImage: `url(${store.custom.backgroundImage.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1.5, sm: 2, md: 2.5 },
                py: { xs: 3, sm: 4, md: 5 },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  pointerEvents: 'none',
                },
              }}
            >
              {/* Informações interativas no canto superior direito */}
              <Box sx={{
                position: 'absolute',
                top: { xs: 12, sm: 16, md: 20 },
                right: { xs: 12, sm: 16, md: 20 },
                zIndex: 10,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
              }}>
                {/* Botão Ver Informações - apenas ícone */}
                <IconButton
                  onClick={() => setInfoModalOpen(true)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    color: '#333333',
                    padding: { xs: '8px', sm: '10px' },
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  aria-label="Informações da loja"
                >
                  <InfoIcon />
                </IconButton>
                
                {/* Seletor de Idioma */}
                <LanguageSelector forStore={true} />
              </Box>
              
              {/* Status e Horário no canto inferior direito */}
              <Box sx={{
                position: 'absolute',
                bottom: { xs: 12, sm: 16, md: 20 },
                right: { xs: 12, sm: 16, md: 20 },
                zIndex: 10,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0.75,
              }}>
                <Chip
                  icon={store.isOpen ? <CheckCircleIcon sx={{ color: '#00a859 !important', fontSize: '0.875rem !important' }} /> : <CancelIcon sx={{ fontSize: '0.875rem !important' }} />}
                  label={store.isOpen ? t('store.open') || 'Aberto' : t('store.closed')}
                  sx={{
                    bgcolor: store.isOpen ? 'rgba(232, 245, 233, 0.95)' : 'rgba(255, 235, 238, 0.95)',
                    color: store.isOpen ? '#00a859' : '#c62828',
                    fontWeight: 500,
                    fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                    height: { xs: '24px', sm: '26px' },
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    '&:hover': {
                      bgcolor: store.isOpen ? 'rgba(232, 245, 233, 1)' : 'rgba(255, 235, 238, 1)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                    '& .MuiChip-icon': {
                      color: 'inherit',
                      marginLeft: '4px',
                    },
                    '& .MuiChip-label': {
                      padding: '0 8px',
                    },
                  }}
                />
                {getTodayOpeningHours() && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.375,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: { xs: '4px 10px', sm: '5px 12px' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                  }}>
                    <AccessTimeIcon sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' }, color: '#666666' }} />
                    <Typography variant="body2" sx={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem' }, 
                      fontWeight: 500,
                      color: '#333333',
                      lineHeight: 1.2,
                    }}>
                      {getTodayOpeningHours().text}
                    </Typography>
                  </Box>
                )}
              </Box>
              {/* Logo centralizada sobre o banner */}
              {store.custom?.logo?.url && (
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 10,
                    width: { xs: '120px', sm: '150px', md: '180px' },
                    height: { xs: '120px', sm: '150px', md: '180px' },
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: { xs: `3px solid ${primaryColor}`, sm: `4px solid ${primaryColor}` },
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img 
                    src={store.custom.logo.url} 
                    alt={store.fantasyName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              )}
              
              {/* Título e slogan agrupados */}
              <Box sx={{ 
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 0.25, sm: 0.5 },
              }}>
                {/* Título da loja abaixo da logo */}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#ffffff',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    textAlign: 'center',
                    textTransform: 'capitalize',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    px: 2,
                    mb: 0,
                  }}
                >
                  {store.fantasyName}
                </Typography>
                
                {/* Descrição da loja (se houver) */}
                {store.description && (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 400, 
                      color: '#ffffff',
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                      textAlign: 'center',
                      textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                      px: 2,
                      maxWidth: '600px',
                      opacity: 0.95,
                      mt: 0,
                    }}
                  >
                    {store.description}
                  </Typography>
                )}
              </Box>
            </Box>
          </S.StoreBanner>
        )}
        
        {/* Conteúdo do header */}
        <Box sx={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: { xs: '16px 20px', sm: '20px 24px', md: '24px 20px' },
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: { xs: 1.5, sm: 2 },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {/* Logo e título apenas se não houver banner */}
              {!store.custom?.backgroundImage?.url && (
                <>
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
                        textTransform: 'capitalize',
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
                </>
              )}
            </Box>
            
            {/* Informações apenas se não houver banner */}
            {!store.custom?.backgroundImage?.url && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {/* Seletor de Idioma */}
                <Box sx={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                  <LanguageSelector forStore={true} />
                </Box>
                
                {/* Status e Horário na mesma linha */}
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
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: '1rem' }} />}
                    label={getTodayOpeningHours().text}
                    sx={{
                      bgcolor: '#f5f5f5',
                      color: '#666666',
                      fontWeight: 400,
                      fontSize: '0.875rem',
                      height: '32px',
                      '& .MuiChip-icon': {
                        color: '#666666',
                      },
                    }}
                  />
                )}
                
                {/* Botão Ver Informações - mesmo tamanho */}
                <Chip
                  icon={<InfoIcon sx={{ fontSize: '1rem' }} />}
                  label={t('store.info')}
                  onClick={() => setInfoModalOpen(true)}
                  sx={{
                    bgcolor: '#f5f5f5',
                    color: '#666666',
                    fontWeight: 400,
                    fontSize: '0.875rem',
                    height: '32px',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#eeeeee',
                    },
                    '& .MuiChip-icon': {
                      color: '#666666',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </S.StoreHeader>

      {/* Produtos por categoria */}
      <S.ProductsSection>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: { xs: '16px', sm: '24px' } }}>
          {products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666666', fontWeight: 400 }}>
                {t('store.noProductsAvailable')}
              </Typography>
            </Box>
          ) : (
            products.map((category, categoryIndex) => (
              <Box key={categoryIndex} sx={{ mb: { xs: 5, sm: 6 } }}>
                <S.CategoryHeader
                  $primaryColor={primaryColor}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 0,
                      color: '#1a1a1a',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      pb: 1.5,
                      textTransform: 'capitalize',
                      position: 'relative',
                      paddingLeft: { xs: '16px', sm: '24px' },
                      paddingRight: { xs: '16px', sm: '24px' },
                    }}
                  >
                    {category.title}
                  </Typography>
                </S.CategoryHeader>
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

      {/* Botão da sacola flutuante */}
      {cartItemsCount > 0 && (
        <Box
          onClick={() => setCartOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: store?.settings?.whatsappFixed && store?.whatsapp ? 80 : 20, sm: store?.settings?.whatsappFixed && store?.whatsapp ? 90 : 24 },
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: primaryColor,
            color: '#fff',
            borderRadius: '24px',
            padding: { xs: '8px 16px', sm: '10px 20px' },
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: { xs: '140px', sm: '160px' },
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              transform: 'translateX(-50%) translateY(-4px)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              bgcolor: primaryColor,
              opacity: 0.95,
            },
            '&:active': {
              transform: 'translateX(-50%) translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Badge 
              badgeContent={cartItemsCount} 
              sx={{ 
                '& .MuiBadge-badge': { 
                  bgcolor: '#fff', 
                  color: primaryColor,
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  minWidth: '20px',
                  height: '20px',
                  border: `2px solid ${primaryColor}`,
                } 
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
            </Badge>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25 }}>
            <Typography sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              lineHeight: 1.2,
            }}>
              {t('store.viewCart')}
            </Typography>
            {cart?.total && (
              <Typography sx={{ 
                fontWeight: 500, 
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                opacity: 0.9,
                lineHeight: 1,
              }}>
                {cart.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            )}
          </Box>
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

      {/* Botão fixo de WhatsApp */}
      {store?.settings?.whatsappFixed && store?.whatsapp && (
        <Box
          component="a"
          href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            position: 'fixed',
            bottom: { xs: cartItemsCount > 0 ? 80 : 16, sm: cartItemsCount > 0 ? 80 : 20 },
            right: { xs: 16, sm: 20 },
            bgcolor: '#25D366',
            color: '#fff',
            borderRadius: '50%',
            width: { xs: '56px', sm: '64px' },
            height: { xs: '56px', sm: '64px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
            cursor: 'pointer',
            zIndex: 999,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#20BA5A',
              transform: 'scale(1.1)',
              boxShadow: '0 6px 20px rgba(37, 211, 102, 0.6)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
          aria-label="Contatar via WhatsApp"
        >
          <WhatsAppIcon sx={{ fontSize: { xs: '32px', sm: '36px' } }} />
        </Box>
      )}
    </S.StoreContainer>
  );
};

export default Store;

