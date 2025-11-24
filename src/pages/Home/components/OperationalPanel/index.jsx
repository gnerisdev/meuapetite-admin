import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  Tooltip,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { keyframes } from '@mui/system';
import { RefreshIcon } from 'components/icons';
import { MoreVertIcon } from 'components/icons';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import { ApplicationUtils } from 'utils/ApplicationUtils';
import { ORDERSTATUS } from 'constants';
import { useTranslation } from 'react-i18next';
import OrderDetailsModal from 'pages/Orders/Details';
import * as S from 'pages/Orders/Index/style';

const OperationalPanel = ({ showDashboard, onToggleDashboard }) => {
  const { t } = useTranslation('admin');
  const apiService = new ApiService();
  const { toast, company } = useContext(GlobalContext);
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [openModalChangeStatus, setOpenModalChangeStatus] = useState(false);
  const [openModalDetails, setOpenModalDetails] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const modalChangeStatusOpen = (order, popupState) => {
    setCurrentOrder(order);
    setSelectedStatus(order.status.name);
    setOpenModalChangeStatus(true);
    popupState.close();
  };

  const modalChangeStatusClose = () => {
    setOpenModalChangeStatus(false);
    setCurrentOrder(null);
  };

  const modalDetailsOpen = (order, popupState) => {
    setCurrentOrder(order);
    setOpenModalDetails(true);
    popupState.close();
  };

  const modalDetailsClose = () => {
    setOpenModalDetails(false);
    setCurrentOrder(null);
  };

  const getOrders = async () => {
    try {
      setIsUpdating(true);
      // Buscar apenas pedidos pendentes e em processamento
      const receivedResponse = await apiService.get('/admin/orders?page=1&status=OrderReceived');
      const processingResponse = await apiService.get('/admin/orders?page=1&status=Processing');
      
      // Combinar e ordenar por data (mais recentes primeiro)
      const allActiveOrders = [
        ...(receivedResponse.data?.orders || []),
        ...(processingResponse.data?.orders || [])
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setOrders(allActiveOrders);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const changeStatus = async () => {
    try {
      setLoading(true);
      await apiService.put('/admin/orders', {
        orderId: currentOrder._id,
        status: selectedStatus,
      });
      modalChangeStatusClose();
      getOrders();
      toast.success('Pedido atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar o status do pedido!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company.online) {
      getOrders();
      
      // Atualizar pedidos a cada 2 minutos quando a loja estiver online
      const interval = setInterval(() => {
        getOrders();
      }, 120000); // 2 minutos = 120000ms

      return () => clearInterval(interval);
    }
  }, [company.online]);

  if (!company.online) {
    return null;
  }

  const pulse = keyframes`
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(2);
    }
  `;

  const float = keyframes`
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-10px) rotate(5deg);
    }
    66% {
      transform: translateY(-5px) rotate(-5deg);
    }
  `;

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh',
      position: 'relative',
      pb: 4
    }}>
      {/* Header fixo com indicador de atualização */}
      <Box sx={{ 
        position: 'sticky',
        top: 0,
        zIndex: 100,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        mb: 3,
        boxShadow: 1
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '1rem', sm: '1.25rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  animation: `${pulse} 2s ease-in-out infinite`,
                }}
              />
              Painel Operacional
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Botão de atualização manual */}
            <Tooltip title="Atualizar agora">
              <IconButton
                onClick={() => getOrders()}
                disabled={isUpdating}
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&:disabled': { bgcolor: 'grey.400' },
                  ...(isUpdating && {
                    animation: `${pulse} 1s ease-in-out infinite`,
                  }),
                }}
              >
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>


            {isUpdating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Atualizando...
                </Typography>
              </Box>
            )}
            
            <Chip 
              icon={
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
              }
              label="AO VIVO"
              color="success" 
              size="small"
              sx={{ 
                fontSize: '0.65rem',
                fontWeight: 700,
                height: 24,
                px: 1,
                '& .MuiChip-icon': {
                  ml: 0.5,
                }
              }}
            />
            
            {/* Botão Ir para Dashboard */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<span className="fa fa-chart-bar" />}
              onClick={onToggleDashboard}
              sx={{ 
                ml: 1,
                fontSize: '0.75rem',
                height: 32,
                px: 1.5
              }}
            >
              Ir para Dashboard
            </Button>
          </Box>
        </Box>
      </Box>

      {orders.length === 0 ? (
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: 100 }}>
              {/* Animações de ondas concêntricas melhoradas */}
              <Box
                sx={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  opacity: 0.3,
                  animation: `${pulse} 2s ease-out infinite`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  opacity: 0.2,
                  animation: `${pulse} 2s ease-out infinite`,
                  animationDelay: '0.4s',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  opacity: 0.1,
                  animation: `${pulse} 2s ease-out infinite`,
                  animationDelay: '0.8s',
                }}
              />
              
              {/* Ícone central com animação flutuante */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 24,
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)',
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                <span className="fa fa-clipboard-list" />
              </Box>
            </Box>
            
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Nenhum pedido ativo no momento
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Os pedidos aparecerão aqui quando chegarem
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item._id || item.id}>
              <S.CardCustom>
                <S.WrapperAction>
                  <Chip
                    sx={{
                      maxWidth: '200px',
                      background: ApplicationUtils.getStatusColor(item?.status?.name),
                      fontWeight: 600,
                      color: '#fff',
                    }}
                    label={item?.status?.label}
                    variant="filled"
                  />

                  <PopupState variant="popover">
                    {(popupState) => (
                      <>
                        <Tooltip title="Opções">
                          <IconButton 
                            {...bindTrigger(popupState)}
                            sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                            }}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                        <Menu {...bindMenu(popupState)}>
                          <MenuItem 
                            onClick={() => modalDetailsOpen(item, popupState)}
                            sx={{ gap: 1 }}
                          >
                            <span className="fa fa-circle-info"></span>
                            Ver detalhes
                          </MenuItem>
                          <MenuItem 
                            onClick={() => modalChangeStatusOpen(item, popupState)}
                            sx={{ gap: 1 }}
                          >
                            <span className="fa fa-edit"></span>
                            Alterar status
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                  </PopupState>
                </S.WrapperAction>

                <S.CardContentCustom>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h3"
                      sx={{ 
                        fontWeight: 600,
                        mb: 1,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {item?.client?.name} - #{item?.id}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Delivery:
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {item.deliveryType === 'pickup' 
                            ? 'Retirada' 
                            : (item.address?.freeformAddress || `${item.address?.street || ''}, N°${item.address?.number || ''}, ${item.address?.district || ''} - ${item.address?.city || ''}`)
                          }
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Data:
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {new Date(item.date).toLocaleString('pt-BR')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Total:
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            color: 'primary.main',
                            fontSize: '1.25rem'
                          }}
                        >
                          {ApplicationUtils.formatPrice(item.total)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </S.CardContentCustom>
              </S.CardCustom>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Alterar Status */}
      {currentOrder && (
        <Dialog open={openModalChangeStatus} onClose={modalChangeStatusClose}>
          <DialogTitle>Alterar Status - Pedido #{currentOrder.id}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Atualize o status do pedido para refletir a situação atual.
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Novo Status:
              </Typography>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                {ORDERSTATUS.map((status) => (
                  <MenuItem key={status.name} value={status.name}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={modalChangeStatusClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={changeStatus} variant="contained" disabled={loading}>
              {loading ? 'Atualizando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Modal de Detalhes */}
      {currentOrder && (
        <OrderDetailsModal
          order={currentOrder}
          modalView={openModalDetails}
          modalViewClose={modalDetailsClose}
        />
      )}
    </Box>
  );
};

export default OperationalPanel;

