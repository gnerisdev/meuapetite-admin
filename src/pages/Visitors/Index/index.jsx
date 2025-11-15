import { useContext, useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Paper,
  Avatar,
  Stack
} from '@mui/material';
import {
  Visibility,
  Refresh,
  Smartphone,
  Computer,
  Tablet,
  LocationOn,
  AccessTime,
  OpenInNew,
  List,
  Map,
  People,
  Language,
  Public
} from '@mui/icons-material';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import Header from 'components/Header';
import * as S from './style';

const Visitors = () => {
  const { company } = useContext(GlobalContext);
  const apiService = new ApiService();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [visitors, setVisitors] = useState([]);
  const [visitorsWithLocation, setVisitorsWithLocation] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [daysFilter, setDaysFilter] = useState(7);
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Map refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapCenter, setMapCenter] = useState([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    fetchVisitors();
    if (activeTab === 1) {
      fetchVisitorsWithLocation();
    }
  }, [daysFilter, page, activeTab]);

  useEffect(() => {
    if (activeTab === 1 && !mapInstanceRef.current) {
      loadLeaflet();
    }
  }, [activeTab]);

  useEffect(() => {
    if (company?.address?.coordinates?.latitude && company?.address?.coordinates?.longitude) {
      setMapCenter([company.address.coordinates.latitude, company.address.coordinates.longitude]);
      setMapZoom(13);
    }
  }, [company]);

  useEffect(() => {
    if (mapInstanceRef.current && mapCenter) {
      mapInstanceRef.current.setView(mapCenter, mapZoom);
    }
  }, [mapCenter, mapZoom]);

  useEffect(() => {
    filterVisitors();
  }, [visitorsWithLocation, deviceFilter]);

  useEffect(() => {
    if (mapInstanceRef.current && filteredVisitors.length > 0 && activeTab === 1) {
      updateMapMarkers();
    }
  }, [filteredVisitors, activeTab]);

  const loadLeaflet = async () => {
    if (window.L) {
      initializeMap();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      initializeMap();
    };
    document.body.appendChild(script);
  };

  const initializeMap = () => {
    if (!window.L || mapInstanceRef.current || !mapRef.current) return;

    const map = window.L.map(mapRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: true
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    if (company?.address?.coordinates?.latitude && company?.address?.coordinates?.longitude) {
      const storeIcon = window.L.divIcon({
        className: 'store-marker',
        html: `<div style="
          background: #1976d2;
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      const storeMarker = window.L.marker(
        [company.address.coordinates.latitude, company.address.coordinates.longitude],
        { icon: storeIcon }
      ).addTo(map);

      storeMarker.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #1976d2; font-size: 14px;">📍 ${company.fantasyName || 'Sua Loja'}</strong>
          <br/>
          <small style="color: #666;">Localização da loja</small>
        </div>
      `).openPopup();
    }
  };

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    const locationGroups = {};
    filteredVisitors.forEach(visitor => {
      if (visitor.location?.latitude && visitor.location?.longitude) {
        const key = `${visitor.location.latitude.toFixed(4)}_${visitor.location.longitude.toFixed(4)}`;
        if (!locationGroups[key]) {
          locationGroups[key] = [];
        }
        locationGroups[key].push(visitor);
      }
    });

    Object.entries(locationGroups).forEach(([key, group]) => {
      const visitor = group[0];
      const count = group.length;

      const getDeviceIcon = (device) => {
        const colors = {
          mobile: '#4caf50',
          desktop: '#2196f3',
          tablet: '#ff9800'
        };
        const color = colors[visitor.device] || '#9e9e9e';
        return window.L.divIcon({
          className: 'visitor-marker',
          html: `<div style="
            background: ${color};
            width: ${count > 1 ? '28px' : '24px'};
            height: ${count > 1 ? '28px' : '24px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${count > 1 ? '12px' : '0px'};
          ">${count > 1 ? count : ''}</div>`,
          iconSize: [count > 1 ? 28 : 24, count > 1 ? 28 : 24],
          iconAnchor: [count > 1 ? 14 : 12, count > 1 ? 14 : 12]
        });
      };

      const marker = window.L.marker(
        [visitor.location.latitude, visitor.location.longitude],
        { icon: getDeviceIcon(visitor.device) }
      ).addTo(mapInstanceRef.current);

      const popupContent = `
        <div style="min-width: 250px; padding: 8px;">
          <div style="font-weight: bold; color: #1976d2; margin-bottom: 8px; font-size: 14px;">
            ${count > 1 ? `${count} visitantes` : 'Visitante'}
          </div>
          ${group.map((v, idx) => `
            <div style="margin-bottom: ${idx < group.length - 1 ? '12px' : '0'}; padding-bottom: ${idx < group.length - 1 ? '12px' : '0'}; border-bottom: ${idx < group.length - 1 ? '1px solid #eee' : 'none'};">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;">
                <span style="
                  background: ${v.device === 'mobile' ? '#4caf50' : v.device === 'desktop' ? '#2196f3' : '#ff9800'};
                  color: white;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-weight: bold;
                ">${v.device || 'unknown'}</span>
                <span style="font-size: 11px; color: #666; font-weight: 500;">${v.browser || 'N/A'}${v.browserVersion ? ` v${v.browserVersion}` : ''}</span>
              </div>
              <div style="font-size: 10px; color: #666; margin-top: 4px;">
                💻 ${v.os || 'N/A'}${v.osVersion ? ` ${v.osVersion}` : ''}
              </div>
              ${v.screen ? `
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  📱 ${v.screen.width}×${v.screen.height} ${v.screen.orientation ? `(${v.screen.orientation})` : ''}
                </div>
              ` : ''}
              ${v.connection?.effectiveType ? `
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  🌐 ${v.connection.effectiveType}${v.connection.downlink ? ` (${v.connection.downlink} Mbps)` : ''}
                </div>
              ` : ''}
              ${v.timezone ? `
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  🕐 ${v.timezone}
                </div>
              ` : ''}
              ${v.language ? `
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  🌍 ${v.language}
                </div>
              ` : ''}
              <div style="font-size: 10px; color: #666; margin-top: 4px;">
                📅 ${new Date(v.visitStart).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div style="font-size: 10px; color: #666; margin-top: 2px;">
                ⏱️ ${Math.floor(v.timeOnPage / 60)}min ${v.timeOnPage % 60}s
              </div>
              ${v.pagesViewed > 0 ? `
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  👁️ ${v.pagesViewed} páginas
                </div>
              ` : ''}
              ${v.productsViewed > 0 ? `
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  🛍️ ${v.productsViewed} produtos
                </div>
              ` : ''}
              ${v.cartItems > 0 ? `
                <div style="font-size: 10px; color: #4caf50; margin-top: 2px; font-weight: 500;">
                  🛒 ${v.cartItems} itens no carrinho
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    if (filteredVisitors.length > 0) {
      const bounds = window.L.latLngBounds(
        filteredVisitors
          .filter(v => v.location?.latitude && v.location?.longitude)
          .map(v => [v.location.latitude, v.location.longitude])
      );
      if (company?.address?.coordinates?.latitude && company?.address?.coordinates?.longitude) {
        bounds.extend([company.address.coordinates.latitude, company.address.coordinates.longitude]);
      }
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/admin/visitors?days=${daysFilter}&page=${page}&limit=50`);
      if (response.data.success) {
        setVisitors(response.data.visitors || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error('Erro ao buscar visitantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorsWithLocation = async () => {
    try {
      setMapLoading(true);
      const response = await apiService.get(`/admin/visitors/locations?days=${daysFilter}`);
      if (response.data.success) {
        setVisitorsWithLocation(response.data.visitors || []);
      }
    } catch (error) {
      console.error('Erro ao buscar visitantes com localização:', error);
    } finally {
      setMapLoading(false);
    }
  };

  const filterVisitors = () => {
    let filtered = [...visitorsWithLocation];
    
    if (deviceFilter !== 'all') {
      filtered = filtered.filter(v => v.device === deviceFilter);
    }

    setFilteredVisitors(filtered);
  };

  const handleViewDetails = async (sessionId) => {
    try {
      const response = await apiService.get(`/admin/visitors/${sessionId}`);
      if (response.data.success) {
        setSelectedVisitor(response.data.visitor);
        setDetailsOpen(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    }
  };

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'mobile':
        return <Smartphone fontSize="small" />;
      case 'desktop':
        return <Computer fontSize="small" />;
      case 'tablet':
        return <Tablet fontSize="small" />;
      default:
        return <LocationOn fontSize="small" />;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}min ${secs}s` : `${secs}s`;
  };

  // Estatísticas
  const stats = {
    total: visitors.length,
    withLocation: visitors.filter(v => v.location?.latitude && v.location?.longitude).length,
    mobile: visitors.filter(v => v.device === 'mobile').length,
    desktop: visitors.filter(v => v.device === 'desktop').length,
    tablet: visitors.filter(v => v.device === 'tablet').length,
    avgTime: visitors.length > 0
      ? Math.round(visitors.reduce((sum, v) => sum + (v.timeOnPage || 0), 0) / visitors.length)
      : 0
  };

  return (
    <S.Container>
      <Header title="Visitantes" back={-1} />

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total de Visitantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.withLocation}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Com Localização
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Smartphone />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.mobile}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Dispositivos Móveis
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTime />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {Math.floor(stats.avgTime / 60)}min
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tempo Médio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 150 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={daysFilter}
                label="Período"
                onChange={(e) => {
                  setDaysFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value={1}>Últimas 24h</MenuItem>
                <MenuItem value={7}>Últimos 7 dias</MenuItem>
                <MenuItem value={30}>Últimos 30 dias</MenuItem>
                <MenuItem value={90}>Últimos 90 dias</MenuItem>
              </Select>
            </FormControl>

            {activeTab === 1 && (
              <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 150 }}>
                <InputLabel>Dispositivo</InputLabel>
                <Select
                  value={deviceFilter}
                  label="Dispositivo"
                  onChange={(e) => setDeviceFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="mobile">Mobile</MenuItem>
                  <MenuItem value="desktop">Desktop</MenuItem>
                  <MenuItem value="tablet">Tablet</MenuItem>
                </Select>
              </FormControl>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <Tooltip title="Atualizar">
              <IconButton 
                onClick={() => {
                  fetchVisitors();
                  if (activeTab === 1) {
                    fetchVisitorsWithLocation();
                  }
                }} 
                disabled={loading || mapLoading}
                sx={{ 
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'rotate(180deg)' }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs e Conteúdo */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? 'fullWidth' : 'standard'}
          >
            <Tab icon={<List />} label={isMobile ? "Lista" : "Lista de Visitantes"} iconPosition="start" />
            <Tab icon={<Map />} label={isMobile ? "Mapa" : "Mapa de Localização"} iconPosition="start" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: activeTab === 1 ? 0 : undefined }}>
          {activeTab === 0 ? (
            // Lista de Visitantes
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {isMobile ? (
                    // Cards para Mobile
                    <Box sx={{ p: 2 }}>
                      {visitors.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            Nenhum visitante encontrado no período selecionado
                          </Typography>
                        </Paper>
                      ) : (
                        <Stack spacing={2}>
                          {visitors.map((visitor) => (
                            <Card 
                              key={visitor._id} 
                              sx={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { 
                                  boxShadow: 4,
                                  transform: 'translateY(-2px)'
                                }
                              }}
                              onClick={() => handleViewDetails(visitor.sessionId)}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ bgcolor: visitor.device === 'mobile' ? '#4caf50' : visitor.device === 'desktop' ? '#2196f3' : '#ff9800' }}>
                                      {getDeviceIcon(visitor.device)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {visitor.device || 'N/A'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {visitor.browser || 'N/A'} {visitor.browserVersion ? `v${visitor.browserVersion}` : ''}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <IconButton size="small">
                                    <Visibility />
                                  </IconButton>
                                </Box>
                                
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Sistema</Typography>
                                    <Typography variant="body2">{visitor.os || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Tempo</Typography>
                                    <Typography variant="body2">{formatTime(visitor.timeOnPage)}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">IP</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                      {visitor.ip || 'N/A'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Localização</Typography>
                                    {visitor.location?.latitude && visitor.location?.longitude ? (
                                      <Chip
                                        icon={<LocationOn />}
                                        label="GPS"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                      />
                                    ) : (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        Não disponível
                                      </Typography>
                                    )}
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Data/Hora</Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                      {new Date(visitor.visitStart).toLocaleString('pt-BR')}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  ) : (
                    // Tabela para Desktop
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Dispositivo</TableCell>
                            <TableCell>Navegador</TableCell>
                            <TableCell>Sistema Operacional</TableCell>
                            <TableCell>IP</TableCell>
                            <TableCell>Localização</TableCell>
                            <TableCell>Tempo na Página</TableCell>
                            <TableCell>Data/Hora</TableCell>
                            <TableCell align="center">Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visitors.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">
                                  Nenhum visitante encontrado no período selecionado
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            visitors.map((visitor) => (
                              <TableRow 
                                key={visitor._id} 
                                hover
                                sx={{ 
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                  '&:hover': { backgroundColor: 'action.hover' }
                                }}
                                onClick={() => handleViewDetails(visitor.sessionId)}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getDeviceIcon(visitor.device)}
                                    <Typography variant="body2">
                                      {visitor.device || 'N/A'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {visitor.browser || 'N/A'}
                                    </Typography>
                                    {visitor.browserVersion && (
                                      <Typography variant="caption" color="text.secondary">
                                        v{visitor.browserVersion}
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2">
                                      {visitor.os || 'N/A'}
                                    </Typography>
                                    {visitor.osVersion && (
                                      <Typography variant="caption" color="text.secondary">
                                        {visitor.osVersion}
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {visitor.ip || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {visitor.location?.latitude && visitor.location?.longitude ? (
                                    <Chip
                                      icon={<LocationOn />}
                                      label="GPS"
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Não disponível
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTime fontSize="small" />
                                    <Typography variant="body2">
                                      {formatTime(visitor.timeOnPage)}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {new Date(visitor.visitStart).toLocaleString('pt-BR')}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                  <Tooltip title="Ver detalhes completos">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewDetails(visitor.sessionId)}
                                    >
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {pagination.pages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <Pagination
                        count={pagination.pages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                        size={isMobile ? 'small' : 'medium'}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          ) : (
            // Mapa
            <Box sx={{ position: 'relative', height: isMobile ? '400px' : '600px', width: '100%' }}>
              {mapLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1000
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <div
                ref={mapRef}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px',
                  zIndex: 1
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes - mantém o mesmo código anterior */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Detalhes do Visitante</Typography>
            <IconButton onClick={() => setDetailsOpen(false)} size="small">
              ×
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVisitor && (
            <Grid container spacing={3}>
              {/* Informações Básicas */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Informações Básicas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Session ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      {selectedVisitor.sessionId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">IP</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      {selectedVisitor.ip || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">User Agent</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                      {selectedVisitor.userAgent || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Dispositivo e Navegador */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Dispositivo
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Tipo</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {getDeviceIcon(selectedVisitor.device)}
                      <Typography variant="body2">{selectedVisitor.device || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Navegador</Typography>
                    <Typography variant="body2">
                      {selectedVisitor.browser || 'N/A'} {selectedVisitor.browserVersion ? `v${selectedVisitor.browserVersion}` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Sistema Operacional</Typography>
                    <Typography variant="body2">
                      {selectedVisitor.os || 'N/A'} {selectedVisitor.osVersion || ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Plataforma</Typography>
                    <Typography variant="body2">{selectedVisitor.platform || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Tela e Viewport */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Tela
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {selectedVisitor.screen && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Resolução</Typography>
                        <Typography variant="body2">
                          {selectedVisitor.screen.width} × {selectedVisitor.screen.height}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Disponível</Typography>
                        <Typography variant="body2">
                          {selectedVisitor.screen.availWidth} × {selectedVisitor.screen.availHeight}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Profundidade de Cor</Typography>
                        <Typography variant="body2">{selectedVisitor.screen.colorDepth || 'N/A'} bits</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Orientação</Typography>
                        <Typography variant="body2">{selectedVisitor.screen.orientation || 'N/A'}</Typography>
                      </Grid>
                    </>
                  )}
                  {selectedVisitor.viewport && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Viewport</Typography>
                      <Typography variant="body2">
                        {selectedVisitor.viewport.width} × {selectedVisitor.viewport.height}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Localização */}
              {selectedVisitor.location?.latitude && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    Localização
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Coordenadas</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {selectedVisitor.location.latitude.toFixed(6)}, {selectedVisitor.location.longitude.toFixed(6)}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<OpenInNew />}
                        href={`https://www.google.com/maps?q=${selectedVisitor.location.latitude},${selectedVisitor.location.longitude}`}
                        target="_blank"
                        sx={{ mt: 1 }}
                      >
                        Abrir no Google Maps
                      </Button>
                    </Grid>
                    {selectedVisitor.location.accuracy && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Precisão</Typography>
                        <Typography variant="body2">{Math.round(selectedVisitor.location.accuracy)}m</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}

              {/* Conexão e Hardware */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Conexão
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {selectedVisitor.connection ? (
                  <Grid container spacing={2}>
                    {selectedVisitor.connection.effectiveType && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Tipo</Typography>
                        <Typography variant="body2">{selectedVisitor.connection.effectiveType}</Typography>
                      </Grid>
                    )}
                    {selectedVisitor.connection.downlink && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Downlink</Typography>
                        <Typography variant="body2">{selectedVisitor.connection.downlink} Mbps</Typography>
                      </Grid>
                    )}
                    {selectedVisitor.connection.rtt && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">RTT</Typography>
                        <Typography variant="body2">{selectedVisitor.connection.rtt}ms</Typography>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">Não disponível</Typography>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Hardware
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {selectedVisitor.hardware ? (
                  <Grid container spacing={2}>
                    {selectedVisitor.hardware.cores && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Núcleos CPU</Typography>
                        <Typography variant="body2">{selectedVisitor.hardware.cores}</Typography>
                      </Grid>
                    )}
                    {selectedVisitor.hardware.memory && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Memória</Typography>
                        <Typography variant="body2">{selectedVisitor.hardware.memory} GB</Typography>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">Não disponível</Typography>
                )}
              </Grid>

              {/* Localização e Idioma */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Localização e Idioma
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {selectedVisitor.timezone && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Fuso Horário</Typography>
                      <Typography variant="body2">{selectedVisitor.timezone}</Typography>
                    </Grid>
                  )}
                  {selectedVisitor.language && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Idioma</Typography>
                      <Typography variant="body2">{selectedVisitor.language}</Typography>
                    </Grid>
                  )}
                  {selectedVisitor.languages && selectedVisitor.languages.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Idiomas Preferidos</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        {selectedVisitor.languages.map((lang, idx) => (
                          <Chip key={idx} label={lang} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Referrer */}
              {selectedVisitor.referrer && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    Origem
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Referrer</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {selectedVisitor.referrer}
                      </Typography>
                    </Grid>
                    {selectedVisitor.referrerDomain && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Domínio</Typography>
                        <Typography variant="body2">{selectedVisitor.referrerDomain}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}

              {/* Plugins */}
              {selectedVisitor.plugins && selectedVisitor.plugins.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    Plugins ({selectedVisitor.plugins.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedVisitor.plugins.map((plugin, idx) => (
                      <Chip key={idx} label={plugin} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Atividade */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Atividade
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">Tempo na Página</Typography>
                    <Typography variant="body2">{formatTime(selectedVisitor.timeOnPage)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">Páginas Visualizadas</Typography>
                    <Typography variant="body2">{selectedVisitor.pagesViewed?.length || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">Produtos Visualizados</Typography>
                    <Typography variant="body2">{selectedVisitor.productsViewed?.length || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">Itens no Carrinho</Typography>
                    <Typography variant="body2">{selectedVisitor.cartItems?.length || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">Visitante Retornando</Typography>
                    <Chip
                      label={selectedVisitor.returningVisitor ? 'Sim' : 'Não'}
                      size="small"
                      color={selectedVisitor.returningVisitor ? 'success' : 'default'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">Cookies Habilitados</Typography>
                    <Chip
                      label={selectedVisitor.cookiesEnabled ? 'Sim' : 'Não'}
                      size="small"
                      color={selectedVisitor.cookiesEnabled ? 'success' : 'default'}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </S.Container>
  );
};

export default Visitors;
