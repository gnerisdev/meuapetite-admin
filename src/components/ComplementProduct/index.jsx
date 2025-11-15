import React, { useEffect, useState, useRef } from 'react';
import {
  Typography,
  Grid,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Box,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { propsTextField } from 'utils/form';
import * as S from './style';

const ComplementProduct = ({ complementsValue, getValue }) => {
  const initComplement = { 
    name: null, max: 1, min: 0, isRequired: null, options: [{ name: null, price: null }] 
  };

  const [complements, setComplements] = useState(() => {
    return complementsValue && complementsValue.length > 0 ? [...complementsValue] : [initComplement];
  });
  
  const isInitialMount = useRef(true);
  const lastComplementsValueRef = useRef(complementsValue);

  const setValue = (index, key, value) => {
    const complementsCurrent = [...complements];
    complementsCurrent[index][key] = value;
    setComplements(complementsCurrent);
    getValue(complementsCurrent, validateData());
  };

  const setValueOption = (index, indexOption, key, value) => {
    const complementsCurrent = [...complements];
    complementsCurrent[index]['options'][indexOption][key] = value;
    setComplements(complementsCurrent);
    getValue(complementsCurrent, validateData());
  };

  const addComplement = (index) => {
    const complementsCurrent = [...complements];
    complementsCurrent[index]['options'].push({ name: '', price: null, priceFormat: null });
    setComplements(complementsCurrent);
    getValue(complementsCurrent, validateData());
  };

  const addComplementGroup = () => {
    const newComplements = [...complements, initComplement];
    setComplements(newComplements);
    getValue(newComplements, validateData());
  };

  const removeComplementGroup = (index) => {
    if (complements.length === 1) {
      const resetComplements = [initComplement];
      setComplements(resetComplements);
      getValue(resetComplements, validateData());
      return;
    }

    let complementsCurrent = [...complements];
    complementsCurrent = complementsCurrent.filter((item, i) => i !== index);
    setComplements(complementsCurrent);
    getValue(complementsCurrent, validateData());
  };

  const removeOption = (complementIndex, optionIndex) => {
    const complementsCurrent = [...complements];
    complementsCurrent[complementIndex]['options'] = complementsCurrent[complementIndex]
      ['options'].filter((item, i) => i !== optionIndex);
    setComplements(complementsCurrent);
    getValue(complementsCurrent, validateData());
  };

  const validateData = () => {
    const errors = [];
    let inBlank = false;

    complements.forEach((item, index) => {
      item.options.forEach((option, i) => {
        if (option.name?.trim().length === 0) inBlank = true;
      });
      
      if (!item.name?.trim().length && !inBlank) {
        errors.push(`O nome do ${index + 1}º complemento está em branco.`);
      }

      if (item.isRequired === null || item.isRequired === undefined) {
        errors.push(`Selecione se o complemento "${item.name?.trim() || index}" é obrigatório ou não.`);
      }

      if (item.max <= 0) {
        errors.push(`A quantidade máxima deve ser maior do que zero.`);
      }

      if (item.isRequired && item.min <= 0) {
        errors.push(`O complemento "${item.name?.trim() || index}" é obrigatório, por isso a quantidade mínima deve ser maior que zero (0).`);
      }

      return errors;
    });

    return errors;
  };

  const maskFormat = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    if (typeof value === 'string') {
      const number = parseInt(value.replace(/\D/g, ''), 10);
      if (isNaN(number)) return 'R$ 0,00';
      return 'R$ ' + (number / 100).toFixed(2).replace('.', ',');
    }
    if (typeof value === 'number') {
      return 'R$ ' + value.toFixed(2).replace('.', ',');
    }
    return 'R$ 0,00';
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastComplementsValueRef.current = complementsValue;
      return;
    }

    // Só atualiza se complementsValue realmente mudou (vindo de fora, não de dentro)
    if (complementsValue !== lastComplementsValueRef.current) {
      lastComplementsValueRef.current = complementsValue;
      
      if (complementsValue && complementsValue.length > 0) {
        setComplements([...complementsValue]);
      } else if (!complementsValue || complementsValue.length === 0) {
        setComplements([initComplement]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complementsValue]);

  return (
    <Box sx={{ width: '100%', pb: 2 }}>
      {complements.map((item, index) => {
        const options = item.options || [];
        const isRequired = complements[index]['isRequired'];

        return (
          <S.CardContainer key={`complement-${index}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ flex: 1, maxWidth: { xs: '100%', sm: '600px' } }}>
                <TextField
                  {...propsTextField}
                  label="Nome do grupo"
                  InputLabelProps={{ shrink: true }}
                  placeholder="Ex: Tamanho, Extras, Bebidas"
                  value={complements[index]['name'] || ''}
                  onChange={(e) => setValue(index, 'name', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      fontWeight: 600,
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid',
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                  fullWidth
                />
              </Box>
              {complements.length > 1 && (
                <IconButton
                  onClick={() => removeComplementGroup(index)}
                  sx={{
                    ml: 1,
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: 'error.light',
                    },
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              )}
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1.5, color: 'text.secondary' }}>
                Tipo de seleção
                  </Typography>
              <RadioGroup
                value={isRequired === null ? '' : String(isRequired)}
                onChange={(e) => setValue(index, 'isRequired', e.target.value === 'true')}
                sx={{ gap: 0 }}
              >
                <S.RadioOption>
                  <FormControlLabel
                    value="false"
                    control={<Radio sx={{ color: 'text.secondary' }} />}
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                          Opcional
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          Cliente pode escolher ou não
                        </Typography>
                      </Box>
                    }
                  />
                </S.RadioOption>
                <S.RadioOption>
                  <FormControlLabel
                    value="true"
                    control={<Radio sx={{ color: 'text.secondary' }} />}
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                          Obrigatório
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          Cliente deve escolher pelo menos uma opção
                        </Typography>
                      </Box>
                    }
                  />
                </S.RadioOption>
              </RadioGroup>
            </FormControl>

            {isRequired !== null && (
              <Box sx={{ maxWidth: { xs: '100%', sm: '300px' }, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      {...propsTextField}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      label="Mínimo"
                      type="number"
                      value={complements[index]['min'] || 0}
                      onChange={(e) => setValue(index, 'min', parseInt(e.target.value) || 0)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      {...propsTextField}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      label="Máximo"
                      type="number"
                      value={complements[index]['max'] || 1}
                      onChange={(e) => setValue(index, 'max', parseInt(e.target.value) || 1)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 2, color: 'text.secondary' }}>
                Opções ({options.length})
              </Typography>
              
              {options.map((option, indexOption) => (
                <S.OptionCard key={`option-${indexOption}`}>
                  <Box sx={{ maxWidth: { xs: '100%', sm: '600px' } }}>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={6} sm={6}>
                    <TextField
                      {...propsTextField}
                        placeholder="Nome da opção"
                        value={complements[index]['options'][indexOption]['name'] || ''}
                      onChange={(e) => setValueOption(index, indexOption, 'name', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={4} sm={4}>
                    <TextField
                      {...propsTextField}
                        placeholder="R$ 0,00"
                        value={complements[index]['options'][indexOption]['priceFormat'] || maskFormat(complements[index]['options'][indexOption]['price'] || 0)}
                      onChange={(e) => {
                          const inputValue = e.target.value;
                          const formatted = maskFormat(inputValue);
                          setValueOption(index, indexOption, 'priceFormat', formatted);
                          const numericString = formatted.replace('R$ ', '').replace(',', '.');
                          const numericValue = parseFloat(numericString) || 0;
                          setValueOption(index, indexOption, 'price', numericValue);
                        }}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={2} sm={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton
                        onClick={() => removeOption(index, indexOption)}
                        size="small"
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                            bgcolor: 'error.light',
                          },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                  </Box>
                </S.OptionCard>
              ))}

              <Box sx={{ maxWidth: { xs: '100%', sm: '400px' } }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => addComplement(index)}
                  fullWidth
                  size="small"
                  sx={{
                    mt: 2,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    minHeight: { xs: '36px', sm: '40px' },
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  Adicionar opção
                </Button>
              </Box>
            </Box>
          </S.CardContainer>
        );
      })}

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        mt: 2
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addComplementGroup}
          size="small"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            minHeight: { xs: '40px', sm: '44px' },
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          Adicionar novo grupo
        </Button>
      </Box>
    </Box>
  );
};

export default ComplementProduct;
