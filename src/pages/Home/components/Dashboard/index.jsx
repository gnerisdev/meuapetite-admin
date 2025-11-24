import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Alert
} from '@mui/material';
import { QrCode2Icon as QrCode2, TrendingUpIcon as TrendingUp, ShoppingCartIcon as ShoppingCart, AttachMoneyIcon as AttachMoney, LocalShippingIcon as LocalShipping, RestaurantIcon as Restaurant, WhatsAppIcon as WhatsApp } from 'components/icons';
import QRCode from 'react-qr-code';
import { getMenuBaseUrl } from 'utils/env';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { ApiService } from 'services/api.service';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
import { GlobalContext } from 'contexts/Global';
import { ApplicationUtils } from 'utils/ApplicationUtils';
import { useTranslation } from 'react-i18next';
import * as S from '../../style';

const Dashboard = ({ showOperationalPanel, onGoToOperationalPanel }) => {
  const { company } = useContext(GlobalContext);
  const { t } = useTranslation('admin');
  const apiService = new ApiService();
  const [barChartData, setBarChartData] = useState(null);
  const [doughnutChartData, setDoughnutChartData] = useState(null);
  const [revenueChartData, setRevenueChartData] = useState(null);
  const [customersChartData, setCustomersChartData] = useState(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    weekOrders: 0,
    weekRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    pendingOrders: 0,
    averageTicket: 0,
    deliveryRate: 0
  });

  const getDashboardStats = async () => {
    try {
      // Estatísticas de hoje
      const todayData = await apiService.post('/admin/finance?period=day', {});
      // Estatísticas da semana
      const weekData = await apiService.post('/admin/finance?period=week', {});
      // Estatísticas do mês
      const monthData = await apiService.post('/admin/finance?period=month', {});

      // Pedidos pendentes
      const pendingOrders = await apiService.get('/admin/orders?page=1&status=OrderReceived');
      
      const todayOrders = todayData.data.totalOrdersPeriod || 0;
      const todayRevenue = todayData.data.totalValuePeriod || 0;
      const weekOrders = weekData.data.totalOrdersPeriod || 0;
      const weekRevenue = weekData.data.totalValuePeriod || 0;
      const monthOrders = monthData.data.totalOrdersPeriod || 0;
      const monthRevenue = monthData.data.totalValuePeriod || 0;
      
      const averageTicket = monthOrders > 0 ? monthRevenue / monthOrders : 0;
      
      // Calcular taxa de delivery
      const allOrders = monthData.data.ordersBriefInfo || [];
      const deliveryOrders = allOrders.filter(o => o.delivery === 'Sim').length;
      const deliveryRate = allOrders.length > 0 ? (deliveryOrders / allOrders.length) * 100 : 0;

      setDashboardStats({
        todayOrders,
        todayRevenue,
        weekOrders,
        weekRevenue,
        monthOrders,
        monthRevenue,
        pendingOrders: pendingOrders.data?.orders?.length || 0,
        averageTicket,
        deliveryRate
      });

      // Preparar gráfico de receita semanal
      const weekOrdersByDate = weekData.data.ordersBriefInfo.reduce((acc, order) => {
        const date = ApplicationUtils.formatDate(order.date, false, false);
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, orders: 0 };
        }
        acc[date].revenue += order.totalValue;
        acc[date].orders += 1;
        return acc;
      }, {});

      const sortedDates = Object.keys(weekOrdersByDate).sort();
      
      setRevenueChartData({
        labels: sortedDates,
        datasets: [
          {
            label: t('dashboard.revenueToday') + ' (R$)',
            data: sortedDates.map(date => weekOrdersByDate[date].revenue),
            borderColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 1
            ) || 'rgba(25, 118, 210, 1)',
            backgroundColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 0.1
            ) || 'rgba(25, 118, 210, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getOrdersDashboard = async () => {
    try {
      const { data } = await apiService.get('/admin/dashboard/orders');
      setBarChartData({
        labels: data.map(item => ApplicationUtils.formatDate(item.date, false, false)),
        datasets: [
          {
            label: t('dashboard.orders'),
            backgroundColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 0.7
            ) || 'rgba(25, 118, 210, 0.7)',
            borderColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 1
            ) || 'rgba(25, 118, 210, 1)',
            borderWidth: 2,
            borderRadius: 8,
            data: data.map(item => item.quantity),
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getTopSellingProducts = async () => {
    try {
      const { data } = await apiService.get('/admin/dashboard/products-topselling');
      
      // Agrupar por produto
      const productsMap = data.reduce((acc, item) => {
        if (!acc[item.productName]) {
          acc[item.productName] = 0;
        }
        acc[item.productName] += item.quantity;
        return acc;
      }, {});

      const topProducts = Object.entries(productsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      setDoughnutChartData({
        labels: topProducts.map(([name]) => name),
        datasets: [{
          label: 'Quantidade Vendida',
          data: topProducts.map(([, qty]) => qty),
          backgroundColor: [
            ApplicationUtils.convertHexToRgba(company?.custom?.colorSecondary || '#1976d2', 0.8) || 'rgba(25, 118, 210, 0.8)',
            ApplicationUtils.convertHexToRgba(company?.custom?.colorSecondary || '#1976d2', 0.6) || 'rgba(25, 118, 210, 0.6)',
            ApplicationUtils.convertHexToRgba(company?.custom?.colorSecondary || '#1976d2', 0.4) || 'rgba(25, 118, 210, 0.4)',
            ApplicationUtils.convertHexToRgba(company?.custom?.colorSecondary || '#1976d2', 0.3) || 'rgba(25, 118, 210, 0.3)',
            ApplicationUtils.convertHexToRgba(company?.custom?.colorSecondary || '#1976d2', 0.2) || 'rgba(25, 118, 210, 0.2)',
          ],
          borderWidth: 2,
          borderColor: '#fff',
        }],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendDailyReport = async () => {
    setSendingReport(true);
    try {
      console.log('[Frontend] Iniciando envio de relatório...');
      const response = await apiService.post('/admin/company/send-daily-report', {});
      console.log('[Frontend] Resposta recebida:', response.data);
      
      if (response.data.success) {
        alert('✅ ' + t('dashboard.reportSent'));
      } else {
        alert('❌ ' + t('dashboard.reportError') + ': ' + (response.data.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('[Frontend] Erro completo:', error);
      console.error('[Frontend] Resposta do erro:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          t('dashboard.reportError');
      
      alert('❌ ' + t('dashboard.reportError') + ': ' + errorMessage);
    } finally {
      setSendingReport(false);
    }
  };

  const getCustomersStats = async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const { data } = await apiService.get(
        `/admin/reports/customers?startDate=${firstDayOfMonth.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`
      );
      
      const topCustomers = data.slice(0, 10);
      
      setCustomersChartData({
        labels: topCustomers.map(item => item.name || 'Cliente'),
        datasets: [{
          label: 'Total Gasto (R$)',
          data: topCustomers.map(item => item.totalSpent),
          backgroundColor: ApplicationUtils.convertHexToRgba(
            company?.custom?.colorPrimary || '#800080', 0.6
          ) || 'rgba(128, 0, 128, 0.6)',
          borderColor: ApplicationUtils.convertHexToRgba(
            company?.custom?.colorPrimary || '#800080', 1
          ) || 'rgba(128, 0, 128, 1)',
          borderWidth: 2
        }]
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (company.online) {
      getOrdersDashboard();
      getTopSellingProducts();
      getDashboardStats();
      getCustomersStats();
    }
  }, [company.online]);

  return (
    <Box>
      {/* Alerta para preencher endereço */}
      {!company?.address?.zipCode && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => window.location.href = '/settings/info?tab=1'}
            >
              {t('dashboard.fill')}
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('dashboard.addressNotFilled')}
          </Typography>
          <Typography variant="caption">
            {t('dashboard.addressNotFilledDescription')}
          </Typography>
        </Alert>
      )}

      {/* Alerta para configurar slug */}
      {!company?.storeUrl && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('dashboard.storeSlugNotConfigured')}
          </Typography>
          <Typography variant="caption">
            {t('dashboard.storeSlugNotConfiguredDescription')}
          </Typography>
        </Alert>
      )}

      {/* Botões de QR Code e Relatório */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 3 },
        gap: 1,
        flexWrap: 'wrap'
      }}>
        {showOperationalPanel && onGoToOperationalPanel && (
          <Button
            variant="contained"
            startIcon={<span className="fa fa-clipboard-list" />}
            onClick={onGoToOperationalPanel}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Ir para Painel Operacional
          </Button>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <IconButton
            onClick={handleSendDailyReport}
            disabled={sendingReport}
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              '&:hover': { bgcolor: 'success.dark' },
              '&:disabled': { bgcolor: 'grey.400' },
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 }
            }}
            title={t('dashboard.sendDailyReport')}
          >
            <WhatsApp sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </IconButton>
          
          <IconButton
            onClick={() => setOpenQRDialog(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 }
            }}
          >
            <QrCode2 sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </IconButton>
        </Box>
      </Box>

      {/* Cards de Métricas Principais */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <S.MetricCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <AttachMoney sx={{ fontSize: { xs: 32, sm: 40 }, color: '#2e7d32' }} />
                <Chip label={t('dashboard.today')} size="small" color="success" />
              </Box>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                {t('dashboard.revenueToday')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32', fontSize: { xs: '1.5rem', sm: '2rem' }, wordBreak: 'break-word' }}>
                {ApplicationUtils.formatPrice(dashboardStats.todayRevenue)}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                <TrendingUp sx={{ fontSize: 14 }} />
                {dashboardStats.todayOrders} {t('dashboard.orders')}
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <S.MetricCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <ShoppingCart sx={{ fontSize: { xs: 32, sm: 40 }, color: '#1976d2' }} />
                <Chip label={t('dashboard.thisMonth')} size="small" color="primary" />
              </Box>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                {t('dashboard.totalOrders')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {dashboardStats.monthOrders}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                <TrendingUp sx={{ fontSize: 14 }} />
                {dashboardStats.weekOrders} {t('dashboard.thisWeek')}
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <S.MetricCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Restaurant sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ed6c02' }} />
                <Chip label={t('dashboard.average')} size="small" color="warning" />
            </Box>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                {t('dashboard.averageTicket')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02', fontSize: { xs: '1.5rem', sm: '2rem' }, wordBreak: 'break-word' }}>
                {ApplicationUtils.formatPrice(dashboardStats.averageTicket)}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                {t('dashboard.perOrder')}
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <S.MetricCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <LocalShipping sx={{ fontSize: { xs: 32, sm: 40 }, color: '#9c27b0' }} />
                <Chip 
                  label={dashboardStats.pendingOrders > 0 ? `${dashboardStats.pendingOrders} ${t('dashboard.pending')}` : t('dashboard.noPending')} 
                  size="small" 
                  color={dashboardStats.pendingOrders > 0 ? 'error' : 'success'}
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
          </Box>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                {t('dashboard.pendingOrders')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {dashboardStats.pendingOrders}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                {dashboardStats.deliveryRate.toFixed(1)}% {t('dashboard.areDelivery')}
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>
      </Grid>

      {/* Cards de Receita Mensal e Semanal */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid item xs={12} md={6}>
          <S.MetricCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('dashboard.weeklyRevenue')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, fontSize: { xs: '1.75rem', sm: '2.5rem' }, wordBreak: 'break-word' }}>
                {ApplicationUtils.formatPrice(dashboardStats.weekRevenue)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {dashboardStats.weekOrders} {t('dashboard.ordersCompleted')}
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <S.MetricCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('dashboard.monthlyRevenue')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 1, fontSize: { xs: '1.75rem', sm: '2.5rem' }, wordBreak: 'break-word' }}>
                {ApplicationUtils.formatPrice(dashboardStats.monthRevenue)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {dashboardStats.monthOrders} {t('dashboard.ordersCompleted')}
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        {revenueChartData && (
          <Grid item xs={12} lg={8}>
            <S.StyledCard>
              <CardHeader 
                title={<Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>{t('dashboard.revenueEvolution')}</Typography>} 
                sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}
              />
              <CardContent sx={{ p: { xs: 1, sm: 3 }, pt: { xs: 0, sm: 1 } }}>
                <S.ChartContainer sx={{ height: { xs: 250, sm: 300 }, width: '100%', maxWidth: '100%' }}>
                  <Line
                    data={revenueChartData}
                      options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: {
                        padding: { left: 0, right: 0, top: 0, bottom: 0 }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${t('dashboard.revenueToday')}: ${ApplicationUtils.formatPrice(context.parsed.y)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 10 }
                          }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return ApplicationUtils.formatPrice(value);
                            },
                            font: { size: 10 }
                          }
                        }
                      }
                    }}
                  />
                </S.ChartContainer>
              </CardContent>
            </S.StyledCard>
          </Grid>
        )}

        {doughnutChartData && (
          <Grid item xs={12} lg={4}>
            <S.StyledCard>
              <CardHeader 
                title={<Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>{t('dashboard.topProducts')}</Typography>} 
                sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}
              />
              <CardContent sx={{ p: { xs: 1, sm: 3 }, pt: { xs: 0, sm: 1 } }}>
                <S.ChartContainer sx={{ height: { xs: 250, sm: 300 }, width: '100%', maxWidth: '100%' }}>
                  <Doughnut
                      data={doughnutChartData} 
                      options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: {
                        padding: { left: 0, right: 0, top: 0, bottom: 0 }
                      },
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            font: { size: 10 },
                            padding: 8
                          }
                        }
                        } 
                      }} 
                    />
                </S.ChartContainer>
              </CardContent>
            </S.StyledCard>
          </Grid>
        )}
      </Grid>

      {/* Gráfico de Pedidos */}
      {barChartData && (
        <S.StyledCard sx={{ mb: { xs: 2, sm: 4 }, width: '100%', maxWidth: '100%' }}>
          <CardHeader 
            title={<Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>{t('dashboard.ordersLast7Days')}</Typography>} 
            sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}
          />
          <CardContent sx={{ p: { xs: 1, sm: 3 }, pt: { xs: 0, sm: 1 } }}>
            <S.ChartContainer sx={{ height: { xs: 250, sm: 300 }, width: '100%', maxWidth: '100%' }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: { left: 0, right: 0, top: 0, bottom: 0 }
                  },
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10 }
                      }
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        callback: function(value) {
                          if (Number.isInteger(value)) return value;
                        },
                        font: { size: 10 }
                      }
                    }
                  }
                }}
              />
            </S.ChartContainer>
          </CardContent>
        </S.StyledCard>
      )}

      {/* Gráfico de Top Clientes */}
      {customersChartData && customersChartData.labels.length > 0 && (
        <S.StyledCard sx={{ mb: { xs: 2, sm: 4 }, width: '100%', maxWidth: '100%' }}>
          <CardHeader 
            title={<Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Top 10 Clientes do Mês</Typography>} 
            sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}
          />
          <CardContent sx={{ p: { xs: 1, sm: 3 }, pt: { xs: 0, sm: 1 } }}>
            <S.ChartContainer sx={{ height: { xs: 250, sm: 300 }, width: '100%', maxWidth: '100%' }}>
              <Bar
                data={customersChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  layout: {
                    padding: { left: 0, right: 0, top: 0, bottom: 0 }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Total Gasto: ${ApplicationUtils.formatPrice(context.parsed.x)}`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return ApplicationUtils.formatPrice(value);
                        },
                        font: { size: 10 }
                      }
                    },
                    y: {
                      ticks: {
                        font: { size: 10 }
                      }
                    }
                  }
                }}
              />
            </S.ChartContainer>
          </CardContent>
        </S.StyledCard>
      )}

      {/* Dialog do QR Code */}
      <Dialog 
        open={openQRDialog} 
        onClose={() => setOpenQRDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 3 },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '500px' }
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <QrCode2 sx={{ fontSize: { xs: 24, sm: 28 } }} />
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{t('dashboard.qrcode')}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 1 }}>
            <Box sx={{ 
              p: { xs: 2, sm: 3 }, 
              bgcolor: 'white', 
              borderRadius: 2, 
              border: '2px solid',
              borderColor: 'divider',
              width: 'fit-content'
            }}>
              <QRCode 
                value={`${getMenuBaseUrl() || window.location.origin}/store/${company.storeUrl}`}
                size={200}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
            <Typography variant="body1" color="textSecondary" align="center" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, px: 1 }}>
              {t('dashboard.qrcodeDescription')}
            </Typography>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                wordBreak: 'break-word',
                textAlign: 'center',
                px: 1
              }}
            >
              {getMenuBaseUrl() || window.location.origin}/store/{company.storeUrl}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 2 } }}>
          <Button onClick={() => setOpenQRDialog(false)} fullWidth sx={{ display: { xs: 'block', sm: 'inline-flex' } }}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

