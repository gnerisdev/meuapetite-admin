import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import { ApplicationUtils } from 'utils/ApplicationUtils';
import Header from 'components/Header';
import BackdropLoading from 'components/BackdropLoading';
import * as S from './style';

const Index = () => {
  const apiService = new ApiService();
  const { toast, company } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [financialData, setFinancialData] = useState([]);
  const [summary, setSummary] = useState({
    totalOrdersPeriod: 0,
    totalValuePeriod: 0,
    totalItemsSoldPeriod: 0,
    averageTicket: 0
  });
  const [chartData, setChartData] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getFinancialData = async () => {
    try {
      setLoading('Buscando...');

      const response = await apiService.post(`/admin/finance?period=${dateRange}`, {});

      const formattedData = response.data.ordersBriefInfo.map(item => ({
        ...item, 
        date: formatDate(item.date), 
        totalValue: parseFloat(item.totalValue),
        formattedValue: parseFloat(item.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      }));

      setFinancialData(formattedData);

      // Calcular resumo
      const totalOrders = response.data.totalOrdersPeriod || 0;
      const totalValue = response.data.totalValuePeriod || 0;
      const totalItems = response.data.totalItemsSoldPeriod || 0;
      const averageTicket = totalOrders > 0 ? totalValue / totalOrders : 0;

      setSummary({
        totalOrdersPeriod: totalOrders,
        totalValuePeriod: totalValue,
        totalItemsSoldPeriod: totalItems,
        averageTicket: averageTicket
      });

      // Preparar dados do gráfico
      const ordersByDate = formattedData.reduce((acc, order) => {
        const date = order.date;
        if (!acc[date]) {
          acc[date] = { date, total: 0, count: 0 };
        }
        acc[date].total += order.totalValue;
        acc[date].count += 1;
        return acc;
      }, {});

      const sortedDates = Object.keys(ordersByDate).sort();
      
      setChartData({
        labels: sortedDates,
        datasets: [
          {
            label: 'Receita (R$)',
            data: sortedDates.map(date => ordersByDate[date].total),
            backgroundColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 0.6
            ) || 'rgba(25, 118, 210, 0.6)',
            borderColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 1
            ) || 'rgba(25, 118, 210, 1)',
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast.error('Erro ao buscar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFinancialData();
  }, [dateRange]);

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const getPeriodLabel = () => {
    const labels = {
      'day': 'Hoje',
      'week': 'Esta Semana',
      'month': 'Este Mês',
      'all': 'Todos os Períodos'
    };
    return labels[dateRange] || 'Este Mês';
  };

  return (
    <Box>
      <Header title="Financeiro" />

      {/* Filtro de Período */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Select 
          sx={{ minWidth: 200, height: '40px' }} 
          value={dateRange} 
          onChange={handleDateRangeChange}
        >
          <MenuItem value="day">Hoje</MenuItem>
          <MenuItem value="week">Esta Semana</MenuItem>
          <MenuItem value="month">Este Mês</MenuItem>
        </Select>
        <Button 
          variant="outlined"
          onClick={getFinancialData}
          sx={{ height: '40px' }}
        >
          Atualizar
        </Button>
      </Box>

      {/* Cards de Métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <S.MetricCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Receita Total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                {ApplicationUtils.formatPrice(summary.totalValuePeriod)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {getPeriodLabel()}
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <S.MetricCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Total de Pedidos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {summary.totalOrdersPeriod}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Pedidos concluídos
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <S.MetricCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Ticket Médio
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                {ApplicationUtils.formatPrice(summary.averageTicket)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Por pedido
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <S.MetricCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Itens Vendidos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {summary.totalItemsSoldPeriod}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total de itens
              </Typography>
            </CardContent>
          </S.MetricCard>
        </Grid>
      </Grid>

      {/* Gráfico de Receita */}
      {chartData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Evolução da Receita - {getPeriodLabel()}
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Receita: ${ApplicationUtils.formatPrice(context.parsed.y)}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return ApplicationUtils.formatPrice(value);
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Pedidos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Detalhamento de Pedidos
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Entrega</strong></TableCell>
                  <TableCell align="right"><strong>Itens</strong></TableCell>
                  <TableCell align="right"><strong>Valor Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialData.length > 0 ? (
                  financialData.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>#{row.id}</TableCell>
                      <TableCell>{row.client}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.delivery === 'Sim' ? 'Delivery' : 'Retirada'} 
                          size="small"
                          color={row.delivery === 'Sim' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">{row.totalItems}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.formattedValue}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        Nenhum pedido encontrado para o período selecionado
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <BackdropLoading loading={loading} />
    </Box>
  );
};

export default Index;
