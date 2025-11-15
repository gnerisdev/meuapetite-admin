import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { ApiService } from 'services/api.service';

const OrderConfirmation = () => {
  const { slug, orderId } = useParams();
  const [searchParams] = useSearchParams();
  const apiService = new ApiService(false);
  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const needsConfirmation = searchParams.get('confirm') === 'true';

  useEffect(() => {
    if (slug && orderId) {
      fetchOrderData();
    }
  }, [slug, orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.get(`/menu/${slug}/order/${orderId}`);
      if (data.order && data.company) {
        setOrder(data.order);
        setCompany(data.company);
        setConfirmed(data.order.whatsappConfirmed || false);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      setConfirming(true);
      const { data } = await apiService.post('/menu/confirm-whatsapp', {
        orderId: parseInt(orderId),
      });

      if (data.success) {
        setConfirmed(true);
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
      alert('Erro ao confirmar pedido. Tente novamente.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order || !company) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5">Pedido não encontrado</Typography>
        <Typography variant="body2" color="text.secondary">O pedido que você está procurando não foi encontrado.</Typography>
      </Box>
    );
  }

  const primaryColor = company.custom?.colorPrimary || '#800080';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Box sx={{ maxWidth: '600px', margin: '0 auto', px: 2 }}>
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 2 }}>
          {/* Status do pedido */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {confirmed ? (
              <>
                <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: '#4caf50' }}>
                  Pedido Confirmado!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Seu pedido foi confirmado e está sendo processado.
                </Typography>
              </>
            ) : needsConfirmation ? (
              <>
                <WhatsAppIcon sx={{ fontSize: 80, color: '#25d366', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  Confirme seu Pedido
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Envie a mensagem que foi aberta no WhatsApp para confirmar seu pedido.
                </Typography>
              </>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Este pedido ainda não foi confirmado via WhatsApp.
                </Alert>
              </>
            )}
          </Box>

          {/* Informações do pedido */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Pedido #{order.id}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Cliente
              </Typography>
              <Typography variant="body1">{order.client.name}</Typography>
              {order.client.phoneNumber && (
                <Typography variant="body2" color="text.secondary">
                  {order.client.phoneNumber}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Tipo de Entrega
              </Typography>
              <Typography variant="body1">
                {order.deliveryType === 'pickup' ? 'Retirada na loja' : 'Delivery'}
              </Typography>
              {order.deliveryType === 'delivery' && order.address && (
                <Typography variant="body2" color="text.secondary">
                  {order.address.street}, N°{order.address.number}
                  {order.address.district && ` - ${order.address.district}`}
                  {order.address.city && `, ${order.address.city}`}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: primaryColor }}>
                {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>
          </Box>

          {/* Botão de confirmação */}
          {needsConfirmation && !confirmed && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => setShowConfirmDialog(true)}
                sx={{
                  bgcolor: '#25d366',
                  color: '#fff',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#20ba5a',
                  },
                }}
                startIcon={<WhatsAppIcon />}
              >
                Já enviei a mensagem no WhatsApp
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Clique aqui após enviar a mensagem no WhatsApp para confirmar seu pedido
              </Typography>
            </Box>
          )}

          {confirmed && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Pedido confirmado em {new Date(order.whatsappConfirmedAt).toLocaleString('pt-BR')}
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Dialog de confirmação */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirmar Pedido</DialogTitle>
        <DialogContent>
          <Typography>
            Você confirma que já enviou a mensagem do pedido para o WhatsApp da loja?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmOrder}
            variant="contained"
            disabled={confirming}
            sx={{ bgcolor: '#25d366', '&:hover': { bgcolor: '#20ba5a' } }}
          >
            {confirming ? <CircularProgress size={20} /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderConfirmation;

