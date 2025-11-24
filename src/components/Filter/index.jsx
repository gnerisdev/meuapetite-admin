import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextField,
  MenuItem,
  Button,
  Box,
  InputAdornment,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Collapse
} from '@mui/material';
import * as S from './style';

const Filter = ({ filters, onApplyFilters, initialValues = {} }) => {
  const { t } = useTranslation('admin');
  const [selectedFilters, setSelectedFilters] = useState(initialValues);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setSelectedFilters(initialValues);
      const hasFilters = Object.values(initialValues).some(val => val !== '' && val !== null && val !== undefined);
      setHasActiveFilters(hasFilters);
    }
  }, [initialValues]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...selectedFilters, [filterName]: value };
    setSelectedFilters(newFilters);
    
    // Verificar se há filtros ativos
    const hasFilters = Object.values(newFilters).some(val => val !== '' && val !== null && val !== undefined);
    setHasActiveFilters(hasFilters);
  };

  const applyFilters = () => {
    onApplyFilters(selectedFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setSelectedFilters(emptyFilters);
    setHasActiveFilters(false);
    onApplyFilters(emptyFilters);
  };

  const removeFilter = (filterName) => {
    const newFilters = { ...selectedFilters };
    delete newFilters[filterName];
    setSelectedFilters(newFilters);
    
    const hasFilters = Object.values(newFilters).some(val => val !== '' && val !== null && val !== undefined);
    setHasActiveFilters(hasFilters);
    onApplyFilters(newFilters);
  };

  const getInputProps = (filter) => {
    const baseProps = {
      fullWidth: true,
      size: 'small',
      variant: 'outlined',
    };

    if (filter.type === 'text') {
      return {
        ...baseProps,
        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <span className="fas fa-search" style={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '1rem' }} />
            </InputAdornment>
          ),
        },
      };
    }

    if (filter.type === 'date') {
      return {
        ...baseProps,
        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <span className="fas fa-calendar-alt" style={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '1rem' }} />
            </InputAdornment>
          ),
        },
      };
    }

    return baseProps;
  };

  return (
    <S.ContainerMain elevation={2}>
      <CardContent sx={{ p: isExpanded ? 2 : '12px 16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isExpanded ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="fas fa-filter" style={{ color: 'var(--mui-palette-primary-main)', fontSize: '1.5rem' }} />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {t('filter.title') || 'Filtros'}
            </Typography>
            {hasActiveFilters && (
              <Chip 
                label={Object.values(selectedFilters).filter(v => v !== '' && v !== null && v !== undefined).length}
                size="small"
                color="primary"
                sx={{ height: '20px', minWidth: '20px' }}
              />
            )}
          </Box>
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
            sx={{
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <span className="fas fa-chevron-up" />
          </IconButton>
        </Box>

        <Collapse in={isExpanded}>
          <S.FilterContainer>
            {filters.map((filter) => (
              <Box key={filter.name} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {filter.label}
                </Typography>
                
                {filter.type === 'text' && (
                  <TextField
                    id={filter.name}
                    value={selectedFilters[filter.name] || ''}
                    placeholder={filter.placeholder}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    {...getInputProps(filter)}
                  />
                )}

                {filter.type === 'date' && (
                  <TextField
                    id={filter.name}
                    type="date"
                    value={selectedFilters[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    {...getInputProps(filter)}
                  />
                )}

                {filter.type === 'select' && (
                  <TextField
                    id={filter.name}
                    select
                    value={selectedFilters[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    {...getInputProps(filter)}
                  >
                    <MenuItem value="">
                      <em>{filter.placeholder}</em>
                    </MenuItem>
                    {filter.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Box>
            ))}
          </S.FilterContainer>

          {hasActiveFilters && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Filtros ativos:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {Object.entries(selectedFilters).map(([key, value]) => {
                  if (!value || value === '') return null;
                  const filter = filters.find(f => f.name === key);
                  const displayValue = filter?.type === 'select' 
                    ? filter.options.find(opt => opt.value === value)?.label || value
                    : value;
                  return (
                    <Chip
                      key={key}
                      label={`${filter?.label}: ${displayValue}`}
                      onDelete={() => removeFilter(key)}
                      deleteIcon={<span className="fas fa-times" style={{ fontSize: '0.875rem' }} />}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          <S.ContainerButton>
            <Button
              variant="outlined"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              sx={{ minWidth: 120 }}
            >
              <span className="fas fa-times" style={{ marginRight: '8px' }} />
              {t('filter.clear')}
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              sx={{ minWidth: 120 }}
            >
              <span className="fas fa-filter" style={{ marginRight: '8px' }} />
              {t('filter.apply')}
            </Button>
          </S.ContainerButton>
        </Collapse>
      </CardContent>
    </S.ContainerMain>
  );
};

export default Filter;
