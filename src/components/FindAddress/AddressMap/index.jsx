import { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import toast from 'react-hot-toast';

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      ref={markerRef}
      draggable={true}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker != null) {
            const latlng = marker.getLatLng();
            setPosition([latlng.lat, latlng.lng]);
          }
        },
      }}
    />
  );
}

function MapController({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  
  return null;
}

const AddressMap = ({ getAddress, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    district: '',
    city: '',
    state: '',
    zipCode: '',
    number: '',
    reference: '',
    country: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // Geocodificação reversa usando Nominatim (OpenStreetMap)
  const reverseGeocode = async (lat, lng) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MeuApetite/1.0',
          },
        }
      );

      const data = response.data.address || {};
      
      setAddress({
        street: data.road || data.street || '',
        district: data.suburb || data.neighbourhood || data.quarter || '',
        city: data.city || data.town || data.village || data.municipality || '',
        state: data.state || data.region || '',
        zipCode: data.postcode || '',
        number: '',
        reference: '',
        country: data.country || '',
      });
    } catch (error) {
      console.error('Erro na geocodificação reversa:', error);
      toast.error('Não foi possível obter o endereço desta localização');
    } finally {
      setLoading(false);
    }
  };

  // Buscar endereço por texto
  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um endereço para buscar');
      return;
    }

    try {
      setSearching(true);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MeuApetite/1.0',
          },
        }
      );

      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar endereço');
    } finally {
      setSearching(false);
    }
  };

  // Quando a posição mudar, fazer geocodificação reversa
  useEffect(() => {
    if (position) {
      reverseGeocode(position[0], position[1]);
    }
  }, [position]);

  // Obter localização atual do usuário
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          if (mapInstance) {
            mapInstance.setView([latitude, longitude], 15);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          toast.error('Não foi possível obter sua localização');
          setLoading(false);
        }
      );
    } else {
      toast.error('Geolocalização não suportada pelo navegador');
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    if (mapInstance) {
      mapInstance.setView([lat, lng], 15);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    if (!position) {
      toast.error('Selecione uma localização no mapa');
      return;
    }

    if (!address.street || !address.city) {
      toast.error('Preencha pelo menos a rua e a cidade');
      return;
    }

    getAddress({
      ...address,
      coordinates: {
        latitude: position[0],
        longitude: position[1],
      },
      freeformAddress: `${address.street}, ${address.number || ''}, ${address.city || ''}, ${address.country || ''}`,
    });
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Mapa" />
        <Tab label="Buscar" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              {loading ? <CircularProgress size={16} /> : '📍 Minha localização'}
            </Button>
          </Box>

          <Box sx={{ height: '400px', width: '100%', mb: 2, borderRadius: 1, overflow: 'hidden' }}>
            <MapContainer
              center={position || [-23.5505, -46.6333]} // São Paulo como padrão
              zoom={position ? 15 : 3}
              style={{ height: '100%', width: '100%' }}
              whenCreated={setMapInstance}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController position={position} />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {position && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Arraste o marcador no mapa para ajustar a localização
            </Alert>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar endereço (ex: Rua das Flores, São Paulo)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchAddress();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={searchAddress}
              disabled={searching}
            >
              {searching ? <CircularProgress size={20} /> : 'Buscar'}
            </Button>
          </Box>

          {searchResults.length > 0 && (
            <Box sx={{ mb: 2, maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map((result, index) => (
                <Box
                  key={index}
                  onClick={() => handleSelectSearchResult(result)}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {result.display_name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Endereço encontrado:
        </Typography>
        <TextField
          fullWidth
          label="Rua"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          margin="dense"
          required
        />
        <TextField
          fullWidth
          label="Bairro"
          value={address.district}
          onChange={(e) => setAddress({ ...address, district: e.target.value })}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Cidade"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          margin="dense"
          required
        />
        <TextField
          fullWidth
          label="Estado/Província"
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value })}
          margin="dense"
        />
        <TextField
          fullWidth
          label="CEP/Código Postal"
          value={address.zipCode}
          onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
          margin="dense"
        />
        <TextField
          fullWidth
          label="País"
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Número"
          value={address.number}
          onChange={(e) => setAddress({ ...address, number: e.target.value })}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Referência/Complemento"
          value={address.reference}
          onChange={(e) => setAddress({ ...address, reference: e.target.value })}
          margin="dense"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={!position || !address.street || !address.city}
        >
          Confirmar Endereço
        </Button>
      </Box>
    </Box>
  );
};

export default AddressMap;


