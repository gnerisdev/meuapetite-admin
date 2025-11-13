import { useState, useEffect, useContext } from 'react';
import jsPDFInvoiceTemplate, { OutputType } from "jspdf-invoice-template";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Button,
  Chip,
  Menu,
  Pagination,
  Box,
  DialogActions,
  Select,
  Typography,
  Grid,
  DialogContentText,
  Dialog,
  DialogContent,
  MenuItem,
  DialogTitle
} from '@mui/material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import { ApplicationUtils } from 'utils/ApplicationUtils';
import { ORDERSTATUS } from 'constants';
import Header from 'components/Header';
import Filter from 'components/Filter';
import OrderDetailsModal from '../Details';
import CreateManualOrder from '../CreateManual';
import BackdropLoading from 'components/BackdropLoading';
import * as S from './style';


const filters = [
  {
    name: 'searchTerm',
    label: 'Pesquisa',
    placeholder: 'Pedido, cliente ou endereço...',
    type: 'text'
  },
  {
    name: 'startDate',
    label: 'Data inicial',
    placeholder: 'Start Date',
    type: 'date'
  },
  {
    name: 'endDate',
    label: 'Data final',
    placeholder: 'End Date',
    type: 'date'
  },
  {
    name: 'status',
    label: 'Status',
    placeholder: 'Status',
    type: 'select',
    options: ORDERSTATUS.map(order => ({ value: order.name, label: order.label })),
  },
];

export default function Index() {
  const apiService = new ApiService();
  const { toast, company } = useContext(GlobalContext);
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [totalPages, setTotalPages] = useState([]);
  const [page, setPage] = useState(1);
  const [openModalChangeStatus, setOpenModalChangeStatus] = useState(false);
  const [openModalDetails, setOpenModalDetails] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filter, setFilter] = useState({});
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const modalChangeStatusOpen = (order, popupState) => {
    setCurrentOrder(order);
    setSelectedStatus(order.status.name);
    setOpenModalChangeStatus(true);
    popupState.close();
  };

  const modalChangeStatusClose = () => {
    setOpenModalDetails(false);
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

  const getFilters = async (filter) => {
    setFilter(filter);
    setPage(1);
  };

  const getOrders = async () => {
    try {
      setLoading('Carregando');

      const queryParams = new URLSearchParams();

      if (filter?.searchTerm) queryParams.append('searchTerm', filter.searchTerm);
      if (filter?.startDate) queryParams.append('startDate', filter.startDate);
      if (filter?.endDate) queryParams.append('endDate', filter.endDate);
      if (filter?.status) queryParams.append('status', filter.status);

      const url = `/admin/orders?page=${page}&${queryParams.toString()}`;
      const { data } = await apiService.get(url);

      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (error) {
      toast.error('Erro ao buscar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async () => {
    try {
      setLoading('Atualizando');
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

  const changePage = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const downloadInvoice = (order) => {
    jsPDFInvoiceTemplate({
      outputType: OutputType.Save,
      returnJsPDFDocObject: true,
      fileName: "Invoice 2021",
      orientationLandscape: false,
      compress: true,
      logo: {
        src: company.custom.logo.url,
        type: 'PNG',
        height: 20,
        width: 20,
        margin: { top: 0, left: 0 }
      },
      business: {
        name: company.fantasyName,
        address: company.address.freeformAddress,
        phone: company.whatsapp,
        email: company.email,
      },
      contact: {
        name: order.client.name,
        phone: order.client.phoneNumber,
        email: order.client.email,
      },
      invoice: {
        num: order.id,
        label: 'Número do pedido #: ',
        invDate: 'Data do pedido: ' + ApplicationUtils.formatDate(order.date),
        headerBorder: false,
        tableBodyBorder: true,
        header: [
          { title: 'Item', style: { width: 100 } },
          { title: 'Preço', style: { height: 20 } },
          { title: 'Quantidade', style: { height: 20 } },
          { title: 'Total', style: { height: 20 } }
        ],
        table: order.products.map((item, index) => ([
          item.productName,
          item?.price ?? '-',
          item.quantity,
          item.priceTotal
        ])),
        additionalRows: [
          { 
            col1: 'Subtotal:', 
            col2: ApplicationUtils.formatPrice(order.subtotal), 
            style: { fontSize: 10 } 
          },
          { 
            col1: 'Taxa de entrega:', 
            col2:  order.deliveryType === 'customerPickup' 
              ? 'A combinar' 
              : order.deliveryType === 'pickup' 
                ? 'R$ 0,00 (Retirada)'
                : order.deliveryType === 'delivery' 
                  ? ApplicationUtils.formatPrice(order.address.price)
                  : '-',
            style: { fontSize: 10 } 
          },
          { 
            col1: 'Total:', 
            col2:  ApplicationUtils.formatPrice(order.total), 
            style: { fontSize: 14 } 
          },
        ],
      },
      footer: { text: company.slogan },
      pageEnable: true,
      pageLabel: "Pág ",
    });
  };

  useEffect(() => {
    getOrders();
  }, [page, filter]);

  return (
    <Box>
      <Header 
        title="Pedidos" 
        buttonText="Novo Pedido"
        buttonClick={() => setOpenCreateModal(true)}
      />

      <Filter filters={filters} onApplyFilters={getFilters} />

      <S.ContainerMain>
        {orders.map((item) => {
          return (
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
                      <Button {...bindTrigger(popupState)}>Opções <KeyboardArrowDownIcon /></Button>

                      <Menu {...bindMenu(popupState)}>
                        <S.MenuItemCuston onClick={() => modalDetailsOpen(item, popupState)}>
                          <span className="fa fa-circle-info"></span> Ver detalhes
                        </S.MenuItemCuston>
                        <S.MenuItemCuston onClick={() => modalChangeStatusOpen(item, popupState)}>
                          <span className="fa fa-edit"></span> Alterar status
                        </S.MenuItemCuston>
                        <S.MenuItemCuston onClick={() => downloadInvoice(item)}>
                          <span className="fa fa-file-pdf"></span> Baixar recibo
                        </S.MenuItemCuston>
                      </Menu>
                    </>
                  )}
                </PopupState>
              </S.WrapperAction>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <S.CardContentCustom sx={{ flex: '1 0 auto', pt: 0 }}>
                  <S.CardInfo>
                    <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <strong>{item?.client?.name} - #{item?.id}</strong>
                      </span>
                    </span>
                    <span>
                      <strong>Delivery: </strong>
                      {item.deliveryType === 'pickup' && 'Retirada'}
                      {item.deliveryType === 'delivery' 
                        && (item.address.freeformAddress || `${item.address.street}, N°${item.address.number}, ${item.address.district} - ${item.address.city}`)
                      }
                    </span>
                    <span>
                      <strong>Data: </strong>{' '}
                      {new Date(item.date).toLocaleString('pt-BR')}
                    </span>
                    <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <strong>Total:</strong> {ApplicationUtils.formatPrice(item.total)}
                      </span>
                    </span>
                  </S.CardInfo>
                </S.CardContentCustom>
              </Box>
            </S.CardCustom>
          );
        })}

        {orders.length > 0 && (
          <Pagination
            sx={{ display: 'flex', justifyContent: 'center', p: '32px' }}
            color="primary"
            count={totalPages}
            page={page}
            onChange={changePage}
          />
        )}

        {!orders.length && <div style={{ textAlign: 'center' }}>Sem pedidos!</div>}
      </S.ContainerMain>

      {currentOrder && (
        <Dialog open={openModalChangeStatus} onClose={modalChangeStatusClose}>
          <DialogTitle>Pedido #{currentOrder.id}</DialogTitle>
          <DialogContent>
            <DialogContentText>Atualize o status do pedido para refletir a situação atual do mesmo.</DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Novo status:</Typography>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  fullWidth
                >
                  {ORDERSTATUS.map((status) => <MenuItem value={status.name}>{status.label}</MenuItem>)}
                </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={modalChangeStatusClose}>Cancelar</Button>
            <Button onClick={changeStatus}>Confirmar</Button>
          </DialogActions>
        </Dialog>
      )}

      {currentOrder && (
        <OrderDetailsModal
          order={currentOrder}
          modalView={openModalDetails}
          modalViewClose={modalDetailsClose}
        />
      )}

      <CreateManualOrder
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => {
          getOrders();
          setOpenCreateModal(false);
        }}
      />

      <BackdropLoading loading={loading} />
    </Box>
  );
}
