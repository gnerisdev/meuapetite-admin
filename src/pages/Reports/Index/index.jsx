import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { PictureAsPdfIcon, TableChartIcon } from 'components/icons';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import { ApplicationUtils } from 'utils/ApplicationUtils';
import Header from 'components/Header';
import BackdropLoading from 'components/BackdropLoading';
import Filter from 'components/Filter';
import jsPDFInvoiceTemplate, { OutputType } from "jspdf-invoice-template";
import * as S from './style';

const Index = () => {
  const apiService = new ApiService();
  const { toast, company } = useContext(GlobalContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [filter, setFilter] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  const filters = [
    {
      name: 'reportType',
      label: 'Tipo de Relatório',
      placeholder: 'Selecione o tipo',
      type: 'select',
      options: [
        { value: 'products', label: 'Por Produto' },
        { value: 'payment-methods', label: 'Por Forma de Pagamento' },
        { value: 'period', label: 'Por Período' },
        { value: 'customers', label: 'Por Cliente' }
      ]
    },
    {
      name: 'startDate',
      label: 'Data Inicial',
      placeholder: 'Data Inicial',
      type: 'date'
    },
    {
      name: 'endDate',
      label: 'Data Final',
      placeholder: 'Data Final',
      type: 'date'
    }
  ];

  const prepareChartData = (data, reportType) => {
    if (!data || data.length === 0) {
      setChartData(null);
      return;
    }

    switch (reportType) {
      case 'products':
        setChartData({
          labels: data.slice(0, 10).map(item => item.productName),
          datasets: [{
            label: 'Receita (R$)',
            data: data.slice(0, 10).map(item => item.totalRevenue),
            backgroundColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 0.6
            ) || 'rgba(25, 118, 210, 0.6)',
            borderColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 1
            ) || 'rgba(25, 118, 210, 1)',
            borderWidth: 2
          }]
        });
        break;
      case 'payment-methods':
        setChartData({
          labels: data.map(item => {
            const labels = {
              'online': 'Online',
              'inDelivery': 'Na Entrega',
              'pix': 'PIX'
            };
            return labels[item.paymentType] || item.paymentType;
          }),
          datasets: [{
            label: 'Receita (R$)',
            data: data.map(item => item.totalRevenue),
            backgroundColor: [
              ApplicationUtils.convertHexToRgba(company?.custom?.colorSecondary || '#1976d2', 0.8) || 'rgba(25, 118, 210, 0.8)',
              ApplicationUtils.convertHexToRgba(company?.custom?.colorSecondary || '#1976d2', 0.6) || 'rgba(25, 118, 210, 0.6)',
              ApplicationUtils.convertHexToRgba(company?.custom?.colorSecondary || '#1976d2', 0.4) || 'rgba(25, 118, 210, 0.4)',
            ],
            borderWidth: 2
          }]
        });
        break;
      case 'period':
        setChartData({
          labels: data.map(item => {
            const date = new Date(item.period);
            return date.toLocaleDateString('pt-BR');
          }),
          datasets: [{
            label: 'Receita (R$)',
            data: data.map(item => item.totalRevenue),
            borderColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 1
            ) || 'rgba(25, 118, 210, 1)',
            backgroundColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 0.1
            ) || 'rgba(25, 118, 210, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }]
        });
        break;
      case 'customers':
        setChartData({
          labels: data.slice(0, 10).map(item => item.name || 'Cliente'),
          datasets: [{
            label: 'Total Gasto (R$)',
            data: data.slice(0, 10).map(item => item.totalSpent),
            backgroundColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 0.6
            ) || 'rgba(25, 118, 210, 0.6)',
            borderColor: ApplicationUtils.convertHexToRgba(
              company?.custom?.colorSecondary || '#1976d2', 1
            ) || 'rgba(25, 118, 210, 1)',
            borderWidth: 2
          }]
        });
        break;
    }
  };

  const fetchReportWithFilter = async (filterToUse) => {
    if (!filterToUse || !filterToUse.reportType || !filterToUse.startDate || !filterToUse.endDate) {
      return;
    }

    try {
      setLoading(true);
      let url = '';
      
      switch (filterToUse.reportType) {
        case 'products':
          url = `/admin/reports/products?startDate=${filterToUse.startDate}&endDate=${filterToUse.endDate}`;
          break;
        case 'payment-methods':
          url = `/admin/reports/payment-methods?startDate=${filterToUse.startDate}&endDate=${filterToUse.endDate}`;
          break;
        case 'period':
          url = `/admin/reports/period?startDate=${filterToUse.startDate}&endDate=${filterToUse.endDate}&groupBy=day`;
          break;
        case 'customers':
          url = `/admin/reports/customers?startDate=${filterToUse.startDate}&endDate=${filterToUse.endDate}`;
          break;
        default:
          return;
      }

      const { data } = await apiService.get(url);
      setReportData(data);
      prepareChartData(data, filterToUse.reportType);
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      toast.error('Erro ao buscar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    // Mesclar com filtros existentes para manter valores padrão
    const mergedFilter = { ...filter, ...newFilter };
    setFilter(mergedFilter);
    // Se todos os filtros necessários estiverem preenchidos, buscar relatório
    if (mergedFilter.reportType && mergedFilter.startDate && mergedFilter.endDate) {
      fetchReportWithFilter(mergedFilter);
    } else {
      // Limpar dados se filtros não estiverem completos
      setReportData(null);
      setChartData(null);
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const defaultFilter = {
        reportType: 'products',
        startDate: firstDayOfMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      setFilter(defaultFilter);
      setIsInitialized(true);
      // Buscar relatório com filtros padrão
      fetchReportWithFilter(defaultFilter);
    }
  }, [isInitialized]);

  const fetchReport = async () => {
    fetchReportWithFilter(filter);
  };

  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    // Criar CSV como alternativa ao Excel
    let csvContent = '';
    let headers = [];
    let rows = [];

    switch (filter.reportType) {
      case 'products':
        headers = ['Produto', 'Quantidade Vendida', 'Receita Total (R$)', 'Número de Pedidos'];
        rows = reportData.map(item => [
          item.productName,
          item.totalQuantity,
          item.totalRevenue.toFixed(2),
          item.ordersCount
        ]);
        break;
      case 'payment-methods':
        headers = ['Tipo de Pagamento', 'Método', 'Total de Pedidos', 'Receita Total (R$)'];
        rows = reportData.flatMap(item => 
          item.methods.map(method => [
            item.paymentType === 'online' ? 'Online' : 
            item.paymentType === 'inDelivery' ? 'Na Entrega' : 'PIX',
            method.method,
            method.totalOrders,
            method.totalRevenue.toFixed(2)
          ])
        );
        break;
      case 'period':
        headers = ['Período', 'Total de Pedidos', 'Receita Total (R$)', 'Total de Itens', 'Ticket Médio (R$)'];
        rows = reportData.map(item => [
          new Date(item.period).toLocaleDateString('pt-BR'),
          item.totalOrders,
          item.totalRevenue.toFixed(2),
          item.totalItems,
          item.averageTicket.toFixed(2)
        ]);
        break;
      case 'customers':
        headers = ['Cliente', 'Telefone', 'Total de Pedidos', 'Total Gasto (R$)', 'Ticket Médio (R$)', 'Último Pedido'];
        rows = reportData.map(item => [
          item.name,
          item.phoneNumber,
          item.totalOrders,
          item.totalSpent.toFixed(2),
          item.averageTicket.toFixed(2),
          new Date(item.lastOrderDate).toLocaleDateString('pt-BR')
        ]);
        break;
    }

    // Converter para CSV
    csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Criar blob e fazer download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${filter.reportType}_${filter.startDate}_${filter.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Relatório exportado!');
  };

  const exportToPDF = () => {
    if (!reportData || reportData.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const reportTypes = {
      'products': 'Relatório por Produto',
      'payment-methods': 'Relatório por Forma de Pagamento',
      'period': 'Relatório por Período',
      'customers': 'Relatório de Clientes'
    };

    // Preparar dados da tabela
    let tableData = [];
    let columns = [];

    switch (filter.reportType) {
      case 'products':
        columns = ['Item', 'Preço', 'Quantidade', 'Total'];
        tableData = reportData.map((item, index) => [
          item.productName,
          ApplicationUtils.formatPrice(item.totalRevenue / item.totalQuantity),
          item.totalQuantity,
          ApplicationUtils.formatPrice(item.totalRevenue)
        ]);
        break;
      case 'payment-methods':
        columns = ['Item', 'Preço', 'Quantidade', 'Total'];
        tableData = reportData.flatMap(item => 
          item.methods.map(method => [
            `${item.paymentType === 'online' ? 'Online' : item.paymentType === 'inDelivery' ? 'Na Entrega' : 'PIX'} - ${method.method}`,
            ApplicationUtils.formatPrice(method.totalRevenue / method.totalOrders),
            method.totalOrders,
            ApplicationUtils.formatPrice(method.totalRevenue)
          ])
        );
        break;
      case 'period':
        columns = ['Item', 'Preço', 'Quantidade', 'Total'];
        tableData = reportData.map(item => [
          new Date(item.period).toLocaleDateString('pt-BR'),
          ApplicationUtils.formatPrice(item.averageTicket),
          item.totalOrders,
          ApplicationUtils.formatPrice(item.totalRevenue)
        ]);
        break;
      case 'customers':
        columns = ['Item', 'Preço', 'Quantidade', 'Total'];
        tableData = reportData.map(item => [
          item.name,
          ApplicationUtils.formatPrice(item.averageTicket),
          item.totalOrders,
          ApplicationUtils.formatPrice(item.totalSpent)
        ]);
        break;
    }

    jsPDFInvoiceTemplate({
      outputType: OutputType.Save,
      returnJsPDFDocObject: true,
      fileName: `relatorio_${reportType}_${startDate}_${endDate}`,
      orientationLandscape: false,
      compress: true,
      logo: company?.custom?.logo?.url ? {
        src: company.custom.logo.url,
        type: 'PNG',
        height: 20,
        width: 20,
        margin: { top: 0, left: 0 }
      } : undefined,
      business: {
        name: company?.fantasyName || 'Empresa',
        address: company?.address?.freeformAddress || '',
        phone: company?.whatsapp || '',
        email: company?.email || '',
      },
      invoice: {
        num: reportTypes[filter.reportType],
        label: 'Tipo de Relatório: ',
        invDate: `Período: ${new Date(filter.startDate).toLocaleDateString('pt-BR')} até ${new Date(filter.endDate).toLocaleDateString('pt-BR')}`,
        headerBorder: false,
        tableBodyBorder: true,
        header: columns,
        table: tableData,
        additionalRows: [
          { 
            col1: 'Total de Registros:', 
            col2: reportData.length.toString(), 
            style: { fontSize: 10 } 
          },
          { 
            col1: 'Gerado em:', 
            col2: new Date().toLocaleString('pt-BR'), 
            style: { fontSize: 10 } 
          },
        ],
      },
      footer: { text: company?.slogan || '' },
      pageEnable: true,
      pageLabel: "Pág ",
    });

    toast.success('Relatório exportado para PDF!');
  };


  const renderMobileCard = (item, index, type) => {
    switch (type) {
      case 'products':
        return (
          <Accordion key={index} sx={{ mb: 1, boxShadow: 2 }}>
            <AccordionSummary
              expandIcon={<span className="fas fa-chevron-down" />}
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                  {item.productName}
                </Typography>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {ApplicationUtils.formatPrice(item.totalRevenue)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Quantidade Vendida</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {item.totalQuantity}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Número de Pedidos</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {item.ordersCount}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">Receita Total</Typography>
                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700, mt: 0.5 }}>
                    {ApplicationUtils.formatPrice(item.totalRevenue)}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      case 'period':
        return (
          <Accordion key={index} sx={{ mb: 1, boxShadow: 2 }}>
            <AccordionSummary
              expandIcon={<span className="fas fa-chevron-down" />}
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                  {new Date(item.period).toLocaleDateString('pt-BR')}
                </Typography>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {ApplicationUtils.formatPrice(item.totalRevenue)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total de Pedidos</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {item.totalOrders}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total de Itens</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {item.totalItems}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">Ticket Médio</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {ApplicationUtils.formatPrice(item.averageTicket)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">Receita Total</Typography>
                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700, mt: 0.5 }}>
                    {ApplicationUtils.formatPrice(item.totalRevenue)}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      case 'customers':
        return (
          <Accordion key={index} sx={{ mb: 1, boxShadow: 2 }}>
            <AccordionSummary
              expandIcon={<span className="fas fa-chevron-down" />}
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.phoneNumber}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {ApplicationUtils.formatPrice(item.totalSpent)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total de Pedidos</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {item.totalOrders}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Ticket Médio</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {ApplicationUtils.formatPrice(item.averageTicket)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">Último Pedido</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {new Date(item.lastOrderDate).toLocaleDateString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">Total Gasto</Typography>
                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700, mt: 0.5 }}>
                    {ApplicationUtils.formatPrice(item.totalSpent)}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      default:
        return null;
    }
  };

  const renderTable = () => {
    if (!reportData || reportData.length === 0) {
      return (
        <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
          Nenhum dado encontrado para o período selecionado
        </Typography>
      );
    }

    // Renderizar cards para mobile
    if (isMobile) {
      if (filter.reportType === 'payment-methods') {
        return (
          <Box>
            {reportData.flatMap((item, itemIndex) =>
              item.methods.map((method, methodIndex) => (
                <Accordion key={`${itemIndex}-${methodIndex}`} sx={{ mb: 1, boxShadow: 2 }}>
                  <AccordionSummary
                    expandIcon={<span className="fas fa-chevron-down" />}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Chip 
                          label={item.paymentType === 'online' ? 'Online' : 
                                 item.paymentType === 'inDelivery' ? 'Na Entrega' : 'PIX'}
                          size="small"
                          color={item.paymentType === 'online' ? 'primary' : 
                                 item.paymentType === 'pix' ? 'success' : 'default'}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {method.method}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {ApplicationUtils.formatPrice(method.totalRevenue)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Total de Pedidos</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                          {method.totalOrders}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary">Receita Total</Typography>
                        <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700, mt: 0.5 }}>
                          {ApplicationUtils.formatPrice(method.totalRevenue)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        );
      }
      return (
        <Box>
          {reportData.map((item, index) => renderMobileCard(item, index, filter.reportType))}
        </Box>
      );
    }

    // Renderizar tabela para desktop
    switch (filter.reportType) {
      case 'products':
        return (
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Produto</strong></TableCell>
                  <TableCell align="right"><strong>Quantidade Vendida</strong></TableCell>
                  <TableCell align="right"><strong>Receita Total</strong></TableCell>
                  <TableCell align="right"><strong>Número de Pedidos</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell align="right">{row.totalQuantity}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ApplicationUtils.formatPrice(row.totalRevenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{row.ordersCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'payment-methods':
        return (
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Tipo de Pagamento</strong></TableCell>
                  <TableCell><strong>Método</strong></TableCell>
                  <TableCell align="right"><strong>Total de Pedidos</strong></TableCell>
                  <TableCell align="right"><strong>Receita Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.flatMap((item, itemIndex) =>
                  item.methods.map((method, methodIndex) => (
                    <TableRow key={`${itemIndex}-${methodIndex}`} hover>
                      <TableCell>
                        <Chip 
                          label={item.paymentType === 'online' ? 'Online' : 
                                 item.paymentType === 'inDelivery' ? 'Na Entrega' : 'PIX'}
                          size="small"
                          color={item.paymentType === 'online' ? 'primary' : 
                                 item.paymentType === 'pix' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{method.method}</TableCell>
                      <TableCell align="right">{method.totalOrders}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ApplicationUtils.formatPrice(method.totalRevenue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'period':
        return (
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Período</strong></TableCell>
                  <TableCell align="right"><strong>Total de Pedidos</strong></TableCell>
                  <TableCell align="right"><strong>Receita Total</strong></TableCell>
                  <TableCell align="right"><strong>Total de Itens</strong></TableCell>
                  <TableCell align="right"><strong>Ticket Médio</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{new Date(row.period).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell align="right">{row.totalOrders}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ApplicationUtils.formatPrice(row.totalRevenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{row.totalItems}</TableCell>
                    <TableCell align="right">
                      {ApplicationUtils.formatPrice(row.averageTicket)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'customers':
        return (
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Telefone</strong></TableCell>
                  <TableCell align="right"><strong>Total de Pedidos</strong></TableCell>
                  <TableCell align="right"><strong>Total Gasto</strong></TableCell>
                  <TableCell align="right"><strong>Ticket Médio</strong></TableCell>
                  <TableCell><strong>Último Pedido</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.phoneNumber}</TableCell>
                    <TableCell align="right">{row.totalOrders}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ApplicationUtils.formatPrice(row.totalSpent)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {ApplicationUtils.formatPrice(row.averageTicket)}
                    </TableCell>
                    <TableCell>
                      {new Date(row.lastOrderDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Header title="Relatórios" />
      
      {/* Filtros */}
      <Filter filters={filters} onApplyFilters={handleFilterChange} initialValues={filter} />
      
      {/* Botões de Exportação */}
      {reportData && reportData.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<TableChartIcon />}
            onClick={exportToExcel}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                bgcolor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Exportar CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={exportToPDF}
            sx={{
              borderColor: '#d32f2f',
              color: '#d32f2f',
              '&:hover': {
                borderColor: '#c62828',
                bgcolor: 'rgba(211, 47, 47, 0.04)'
              }
            }}
          >
            Exportar PDF
          </Button>
        </Box>
      )}

      {/* Gráfico */}
      {chartData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Visualização Gráfica
            </Typography>
            <Box sx={{ height: 400 }}>
              {filter.reportType === 'payment-methods' ? (
                <Doughnut
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              ) : filter.reportType === 'period' ? (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true
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
              ) : (
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      x: {
                        barPercentage: 0.5,
                        categoryPercentage: 0.6
                      },
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
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Detalhamento
          </Typography>
          {renderTable()}
        </CardContent>
      </Card>

      <BackdropLoading loading={loading} />
    </Box>
  );
};

export default Index;

