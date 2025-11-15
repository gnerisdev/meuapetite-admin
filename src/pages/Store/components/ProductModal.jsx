import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  Chip,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CloseIcon, AddIcon, RemoveIcon } from 'components/icons';
import * as S from './ProductModal.style';

const ProductModal = ({ open, product, onClose, onAddToCart, primaryColor, secondaryColor }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [quantity, setQuantity] = useState(1);
  const [selectedComplements, setSelectedComplements] = useState({});
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedComplements({});
      setComment('');
    }
  }, [product]);

  if (!product) return null;

  const handleComplementChange = (complementId, optionId, optionPrice, isMultiple, max) => {
    setSelectedComplements(prev => {
      const newComplements = { ...prev };
      
      if (!newComplements[complementId]) {
        newComplements[complementId] = [];
      }

      const existingIndex = newComplements[complementId].findIndex(opt => opt.id === optionId);

      if (isMultiple) {
        if (existingIndex >= 0) {
          newComplements[complementId].splice(existingIndex, 1);
        } else {
          if (newComplements[complementId].length < max) {
            newComplements[complementId].push({
              id: optionId,
              parentId: complementId,
              price: optionPrice,
              quantity: 1,
            });
          }
        }
      } else {
        newComplements[complementId] = [{
          id: optionId,
          parentId: complementId,
          price: optionPrice,
          quantity: 1,
        }];
      }

      if (newComplements[complementId].length === 0) {
        delete newComplements[complementId];
      }

      return newComplements;
    });
  };

  const updateComplementQuantity = (complementId, optionId, delta) => {
    setSelectedComplements(prev => {
      const newComplements = { ...prev };
      if (!newComplements[complementId]) return newComplements;

      const optionIndex = newComplements[complementId].findIndex(opt => opt.id === optionId);
      if (optionIndex >= 0) {
        const newQuantity = newComplements[complementId][optionIndex].quantity + delta;
        if (newQuantity <= 0) {
          newComplements[complementId].splice(optionIndex, 1);
        } else {
          newComplements[complementId][optionIndex].quantity = newQuantity;
        }

        if (newComplements[complementId].length === 0) {
          delete newComplements[complementId];
        }
      }

      return newComplements;
    });
  };

  const validateComplements = () => {
    if (!product.complements || product.complements.length === 0) return true;

    for (const complement of product.complements) {
      if (complement.isRequired) {
        const selected = selectedComplements[complement._id] || [];
        if (selected.length < complement.min) {
          return false;
        }
      }
    }

    return true;
  };

  const calculatePrice = () => {
    let basePrice = product.priceDiscount || product.price;
    let complementPrice = 0;

    Object.values(selectedComplements).forEach(complementArray => {
      complementArray.forEach(option => {
        complementPrice += option.price * option.quantity;
      });
    });

    return (basePrice + complementPrice) * quantity;
  };

  const handleAddToCartClick = () => {
    if (!validateComplements()) {
      alert('Por favor, selecione os complementos obrigatórios');
      return;
    }

    const allComplements = [];
    Object.values(selectedComplements).forEach(complementArray => {
      allComplements.push(...complementArray);
    });

    const productData = {
      productId: product._id,
      productName: product.name,
      quantity: quantity,
      price: product.priceDiscount || product.price,
      priceTotal: calculatePrice(),
      imageUrl: product.images?.[0]?.url || '',
      complements: allComplements,
      comment: comment,
    };

    onAddToCart(productData);
  };

  const price = calculatePrice();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '16px' },
          maxHeight: { xs: '100vh', sm: '90vh' },
          margin: { xs: 0, sm: '32px' },
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: primaryColor,
        color: '#fff',
        padding: '16px 24px',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {product.name}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ padding: 0 }}>
        {product.images?.[0]?.url && (
          <Box
            sx={{
              width: '100%',
              height: '250px',
              backgroundImage: `url(${product.images[0].url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        <Box sx={{ padding: '24px' }}>
          {product.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.description}
            </Typography>
          )}

          {/* Complementos */}
          {product.complements && product.complements.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Complementos
              </Typography>
              {product.complements.map((complement, index) => {
                const isMultiple = complement.max > 1;
                const selected = selectedComplements[complement._id] || [];
                const isRequired = complement.isRequired;

                return (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {complement.name}
                      </Typography>
                      {isRequired && (
                        <Chip label="Obrigatório" size="small" color="error" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {isMultiple 
                          ? `Selecione até ${complement.max} opção(ões)`
                          : 'Selecione 1 opção'
                        }
                      </Typography>
                    </Box>

                    {isMultiple ? (
                      <Grid container spacing={1}>
                        {complement.options.map((option, optIndex) => {
                          const isSelected = selected.some(opt => opt.id === option._id);
                          const selectedOption = selected.find(opt => opt.id === option._id);
                          
                          return (
                            <Grid item xs={12} sm={6} key={optIndex}>
                              <Box
                                sx={{
                                  border: `2px solid ${isSelected ? primaryColor : '#e0e0e0'}`,
                                  borderRadius: '8px',
                                  padding: '12px',
                                  cursor: 'pointer',
                                  bgcolor: isSelected ? `${primaryColor}10` : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderColor: primaryColor,
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ flex: 1 }}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={isSelected}
                                          onChange={() => {
                                            if (isSelected || selected.length < complement.max) {
                                              handleComplementChange(
                                                complement._id,
                                                option._id,
                                                option.price,
                                                true,
                                                complement.max
                                              );
                                            }
                                          }}
                                          sx={{
                                            color: primaryColor,
                                            '&.Mui-checked': {
                                              color: primaryColor,
                                            },
                                          }}
                                        />
                                      }
                                      label={
                                        <Box>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {option.name}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            +{option.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                  </Box>
                                  {isSelected && selectedOption && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => updateComplementQuantity(complement._id, option._id, -1)}
                                        sx={{ color: primaryColor }}
                                      >
                                        <RemoveIcon fontSize="small" />
                                      </IconButton>
                                      <Typography variant="body2" sx={{ minWidth: '20px', textAlign: 'center' }}>
                                        {selectedOption.quantity}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          if (selectedOption.quantity < complement.max) {
                                            updateComplementQuantity(complement._id, option._id, 1);
                                          }
                                        }}
                                        sx={{ color: primaryColor }}
                                      >
                                        <AddIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                          value={selected[0]?.id || ''}
                          onChange={(e) => {
                            const option = complement.options.find(opt => opt._id === e.target.value);
                            if (option) {
                              handleComplementChange(
                                complement._id,
                                option._id,
                                option.price,
                                false,
                                1
                              );
                            }
                          }}
                        >
                          {complement.options.map((option, optIndex) => (
                            <FormControlLabel
                              key={optIndex}
                              value={option._id}
                              control={
                                <Radio
                                  sx={{
                                    color: primaryColor,
                                    '&.Mui-checked': {
                                      color: primaryColor,
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                  <Typography variant="body2">{option.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    +{option.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Observações */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Observações (opcional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Ex: Sem cebola, bem passado, etc."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
            />
          </Box>

          {/* Quantidade */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Quantidade:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `1px solid ${primaryColor}`, borderRadius: '8px', padding: '4px' }}>
              <IconButton
                size="small"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                sx={{ color: primaryColor }}
              >
                <RemoveIcon />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: '40px', textAlign: 'center' }}>
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setQuantity(quantity + 1)}
                sx={{ color: primaryColor }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px', bgcolor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: primaryColor }}>
              {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleAddToCartClick}
            sx={{
              bgcolor: primaryColor,
              color: '#fff',
              padding: '12px 32px',
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: primaryColor,
                opacity: 0.9,
              },
            }}
          >
            Adicionar ao Carrinho
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;

