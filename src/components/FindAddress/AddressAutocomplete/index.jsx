import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Typography,
  Paper,
  Button
} from '@mui/material';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddressAutocomplete = ({ getData, closeModal, initialAddress = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressDetails, setAddressDetails] = useState({
    street: '',
    number: '',
    district: '',
    city: '',
    state: '',
    zipCode: '',
    reference: '',
    country: '',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Inicializar com endereço existente se houver
  useEffect(() => {
    if (initialAddress) {
      const displayName = initialAddress.freeformAddress || 
        `${initialAddress.street || ''}, ${initialAddress.number || ''}, ${initialAddress.city || ''}`;
      // Usar apenas o texto antes da primeira vírgula
      const firstPart = displayName.split(',')[0].trim();
      setSearchQuery(firstPart);
      setAddressDetails({
        street: initialAddress.street || '',
        number: initialAddress.number || '',
        district: initialAddress.district || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        zipCode: initialAddress.zipCode || '',
        reference: initialAddress.reference || '',
        country: initialAddress.country || '',
      });
      // Marcar como selecionado se tiver dados suficientes
      if (initialAddress.street && initialAddress.city) {
        setSelectedAddress({ display_name: displayName });
      }
    }
  }, [initialAddress]);

  // Formatar endereço para exibição mais concisa
  const formatAddressDisplay = (suggestion) => {
    const address = suggestion.address || {};
    const parts = [];
    
    // Rua e número
    const street = address.road || address.street || address.pedestrian || '';
    const number = address.house_number || '';
    if (street) {
      parts.push(number ? `${street}, ${number}` : street);
    }
    
    // Bairro
    const district = address.suburb || address.neighbourhood || address.quarter || address.city_district || '';
    if (district) {
      parts.push(district);
    }
    
    // Cidade
    const city = address.city || address.town || address.village || address.municipality || '';
    if (city) {
      parts.push(city);
    }
    
    // Estado
    const state = address.state || address.region || '';
    if (state && state.length <= 2) {
      parts.push(state);
    }
    
    return parts.length > 0 ? parts.join(', ') : suggestion.display_name;
  };

  // Buscar sugestões de endereço
  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      
      const searchQuery = query.trim();
      const hasNumber = /\d/.test(searchQuery);
      
      // Melhorar busca no Nominatim com parâmetros otimizados
      // Remover countrycodes para busca global
      const baseUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1&extratags=1&namedetails=1`;
      
      // Se a busca contém número, fazer duas buscas:
      // 1. Busca normal
      // 2. Busca focada no número (se possível extrair rua e número)
      const promises = [];
      
      // Busca principal - global (sem restrição de país)
      promises.push(
        axios.get(baseUrl, {
          headers: {
            'User-Agent': 'MeuApetite/1.0',
          },
        })
      );
      
      // Se contém número, tentar busca mais específica
      if (hasNumber) {
        // Extrair número da query (último número encontrado)
        const numberMatch = searchQuery.match(/\d+/);
        if (numberMatch) {
          const number = numberMatch[0];
          const streetPart = searchQuery.replace(/\d+/g, '').trim();
          
          // Se conseguiu separar rua e número, fazer busca específica
          if (streetPart.length >= 3) {
            const specificQuery = `${streetPart}, ${number}`;
            promises.push(
              axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(specificQuery)}&limit=5&addressdetails=1&extratags=1&namedetails=1`,
                {
                  headers: {
                    'User-Agent': 'MeuApetite/1.0',
                  },
                }
              )
            );
          }
        }
      }
      
      const responses = await Promise.all(promises);
      const allResults = [];
      const seenIds = new Set();
      
      // Combinar resultados, evitando duplicatas
      responses.forEach(response => {
        (response.data || []).forEach(result => {
          if (!seenIds.has(result.place_id)) {
            seenIds.add(result.place_id);
            allResults.push(result);
          }
        });
      });
      
      // Ordenar resultados: priorizar endereços com número quando a busca contém número
      let sortedResults = allResults;
      
      if (hasNumber) {
        sortedResults = sortedResults.sort((a, b) => {
          const aHasNumber = a.address?.house_number ? 1 : 0;
          const bHasNumber = b.address?.house_number ? 1 : 0;
          
          // Se ambos têm número, verificar se corresponde ao número buscado
          if (aHasNumber && bHasNumber) {
            const numberMatch = searchQuery.match(/\d+/);
            if (numberMatch) {
              const searchNumber = numberMatch[0];
              const aMatches = a.address.house_number === searchNumber ? 1 : 0;
              const bMatches = b.address.house_number === searchNumber ? 1 : 0;
              if (aMatches !== bMatches) {
                return bMatches - aMatches;
              }
            }
          }
          
          return bHasNumber - aHasNumber;
        });
      }

      setSuggestions(sortedResults.slice(0, 5));
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      toast.error('Erro ao buscar endereços');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce da busca
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(searchQuery);
        setShowSuggestions(true);
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Buscar detalhes completos do endereço via geocodificação reversa
  const fetchAddressDetails = async (lat, lon) => {
    try {
      // Melhorar busca reversa com parâmetros otimizados
      // Usar zoom maior para mais detalhes e namedetails para mais informações
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18&namedetails=1&extratags=1`,
        {
          headers: {
            'User-Agent': 'MeuApetite/1.0',
          },
        }
      );

      const address = response.data.address || {};
      
      // Mapear código postal (CEP) - funciona globalmente
      // Diferentes países usam diferentes formatos (Brasil: 8 dígitos, EUA: 5 ou 9, etc)
      let zipCode = address.postcode || 
                   address.postal_code || 
                   address.postal || 
                   '';
      
      // Manter formato original do código postal (não remover caracteres)
      // Cada país tem seu formato específico
      if (zipCode) {
        zipCode = zipCode.trim();
      }
      
      // Mapear bairro/distrito - funciona globalmente
      // Diferentes países usam diferentes campos
      const district = address.suburb ||           // Comum em vários países
                      address.neighbourhood ||     // Alternativa comum
                      address.quarter ||          // Bairro/Quarteirão
                      address.city_district ||    // Distrito da cidade
                      address.residential ||    // Área residencial
                      address.village ||          // Vila
                      address.hamlet ||          // Bairro pequeno
                      address.borough ||         // Bairro (EUA/UK)
                      address.subdistrict ||     // Subdistrito
                      '';
      
      return {
        street: address.road || address.street || address.pedestrian || address.footway || address.path || '',
        number: address.house_number || address.house || '',
        district: district,
        city: address.city || address.town || address.village || address.municipality || address.county || '',
        state: address.state || address.region || address.state_district || '',
        zipCode: zipCode,
        country: address.country || '',
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do endereço:', error);
      return null;
    }
  };

  // Formatar endereço de forma limpa para exibição (apenas rua e bairro)
  const formatCleanAddress = (address) => {
    const parts = [];
    const street = address.road || address.street || address.pedestrian || address.footway || '';
    const district = address.suburb || address.neighbourhood || address.quarter || address.city_district || '';
    
    if (street) {
      parts.push(street);
    }
    if (district) {
      parts.push(district);
    }
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

  // Selecionar endereço das sugestões
  const handleSelectSuggestion = async (suggestion) => {
    const address = suggestion.address || {};
    
    // Usar apenas o texto antes da primeira vírgula
    const cleanAddress = formatCleanAddress(address);
    const addressText = cleanAddress || suggestion.display_name || '';
    const firstPart = addressText.split(',')[0].trim();
    setSearchQuery(firstPart);
    setSelectedAddress(suggestion);
    setShowSuggestions(false);
    setLoading(true);

    // Sempre fazer busca reversa para obter dados mais precisos (especialmente CEP e bairro)
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    // Dados iniciais da sugestão
    const initialData = {
      street: address.road || address.street || address.pedestrian || address.footway || address.path || '',
      number: address.house_number || address.house || '',
      district: address.suburb || address.neighbourhood || address.quarter || address.city_district || address.residential || address.village || address.hamlet || address.borough || address.subdistrict || '',
      city: address.city || address.town || address.village || address.municipality || address.county || '',
      state: address.state || address.region || address.state_district || '',
      zipCode: (address.postcode || address.postal_code || address.postal || '').trim(),
      reference: '',
      country: address.country || '',
    };

    // Buscar detalhes completos via geocodificação reversa
    const detailedAddress = await fetchAddressDetails(lat, lon);
    
    // Combinar dados: usar busca reversa como base, mas manter número da sugestão se disponível
    const addressDetails = {
      street: detailedAddress?.street || initialData.street,
      number: initialData.number || detailedAddress?.number || '',
      district: detailedAddress?.district || initialData.district,
      city: detailedAddress?.city || initialData.city,
      state: detailedAddress?.state || initialData.state,
      zipCode: detailedAddress?.zipCode || initialData.zipCode,
      reference: initialData.reference,
      country: detailedAddress?.country || initialData.country,
    };

    setAddressDetails(addressDetails);
    setLoading(false);
  };

  // Confirmar endereço
  const handleConfirm = () => {
    if (!selectedAddress && !addressDetails.street) {
      toast.error('Selecione um endereço da lista de sugestões');
      return;
    }

    if (!addressDetails.street || !addressDetails.city) {
      toast.error('Preencha pelo menos a rua e a cidade');
      return;
    }

    // Criar freeformAddress limpo (apenas rua e bairro)
    let freeformAddress = '';
    const parts = [];
    if (addressDetails.street) {
      parts.push(addressDetails.street);
    }
    if (addressDetails.district) {
      parts.push(addressDetails.district);
    }
    freeformAddress = parts.join(', ');

    const addressData = {
      ...addressDetails,
      coordinates: selectedAddress ? {
        latitude: parseFloat(selectedAddress.lat),
        longitude: parseFloat(selectedAddress.lon),
      } : null,
      freeformAddress: freeformAddress || `${addressDetails.street}, ${addressDetails.number || ''}, ${addressDetails.city || ''}`,
    };

    getData(addressData);
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Digite o endereço (ex: Rua das Flores, 123, São Paulo)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          InputProps={{
            endAdornment: loading ? <CircularProgress size={20} /> : null,
          }}
          autoFocus
        />
      </Box>

      {/* Lista de sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          ref={suggestionsRef}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            mt: 0.5,
            boxShadow: 3,
          }}
        >
          <List dense>
            {suggestions.map((suggestion, index) => {
              const address = suggestion.address || {};
              const street = address.road || address.street || address.pedestrian || address.footway || '';
              const district = address.suburb || address.neighbourhood || address.quarter || address.city_district || '';
              
              // Construir texto principal: apenas rua e bairro
              let primaryText = '';
              if (street) {
                primaryText = street;
                if (district) {
                  primaryText = `${primaryText}, ${district}`;
                }
              } else {
                // Se não tiver rua, usar primeira parte do display_name
                primaryText = suggestion.display_name.split(',')[0]?.trim() || '';
              }
              
              return (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSelectSuggestion(suggestion)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {primaryText}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}

      {/* Campos de detalhes do endereço */}
      {selectedAddress && (
        <Box sx={{ mt: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Carregando detalhes do endereço...
              </Typography>
            </Box>
          )}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Confirme os dados do endereço:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Rua"
              value={addressDetails.street}
              onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
              margin="dense"
              required
            />
            <TextField
              sx={{ width: '120px' }}
              label="Número"
              value={addressDetails.number}
              onChange={(e) => setAddressDetails({ ...addressDetails, number: e.target.value })}
              margin="dense"
            />
          </Box>

          <TextField
            fullWidth
            label="Bairro"
            value={addressDetails.district}
            onChange={(e) => setAddressDetails({ ...addressDetails, district: e.target.value })}
            margin="dense"
          />

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Cidade"
              value={addressDetails.city}
              onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
              margin="dense"
              required
            />
            <TextField
              sx={{ width: '150px' }}
              label="Estado"
              value={addressDetails.state}
              onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
              margin="dense"
            />
            <TextField
              sx={{ width: '100px' }}
              label="CEP"
              value={addressDetails.zipCode}
              onChange={(e) => setAddressDetails({ ...addressDetails, zipCode: e.target.value })}
              margin="dense"
            />
          </Box>

          <TextField
            fullWidth
            label="Referência/Complemento"
            value={addressDetails.reference}
            onChange={(e) => setAddressDetails({ ...addressDetails, reference: e.target.value })}
            margin="dense"
            placeholder="Ex: Próximo ao mercado, apto 101, etc."
          />
        </Box>
      )}

      {/* Botão de confirmar */}
      {selectedAddress && (
        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          {closeModal && (
            <Button
              variant="outlined"
              onClick={closeModal}
              sx={{ flex: 1 }}
            >
              Cancelar
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{ flex: 1 }}
            disabled={!addressDetails.street || !addressDetails.city}
          >
            Confirmar Endereço
          </Button>
        </Box>
      )}

      {!selectedAddress && searchQuery.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Digite pelo menos 3 caracteres para ver sugestões de endereços
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AddressAutocomplete;

