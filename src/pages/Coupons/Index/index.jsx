import React, { useState, useEffect, useContext } from 'react';
import { EditIcon, DeleteIcon, MoreVertIcon, CheckCircleIcon, CancelIcon } from 'components/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Button, 
  Pagination, 
  Box, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Menu, 
  Chip, 
  IconButton, 
  Typography,
  Grid,
  Tooltip
} from '@mui/material';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { useTranslation } from 'react-i18next';
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import Header from 'components/Header';
import BackdropLoading from 'components/BackdropLoading';
import Filter from 'components/Filter';
import * as S from './style';

const Index = () => {
  const { t } = useTranslation('admin');
  const apiService = new ApiService();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useContext(GlobalContext);
  const [coupons, setCoupons] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filter, setFilter] = useState({
    status: searchParams.get('status') || '',
    searchTerm: searchParams.get('search') || '',
  });

  const filters = [
    {
      name: 'searchTerm',
      label: 'Buscar',
      placeholder: 'Buscar por código ou nome...',
      type: 'text'
    },  
    {
      name: 'status',
      label: 'Status',
      placeholder: 'Todos',
      type: 'select',
      options: [
        { value: true, label: 'Ativo' }, 
        { value: false, label: 'Inativo' }, 
      ]
    }
  ];

  const getCoupons = async () => {
    try {
      setLoading('Carregando...');

      const pageFromUrl = searchParams.get('page') || '1';
      let url = `/admin/coupons?page=${pageFromUrl}`;

      if (filter.status) {
        url += `&status=${encodeURIComponent(filter.status)}`;
      }

      if (filter.searchTerm) {
        url += `&search=${encodeURIComponent(filter.searchTerm)}`;
      }

      const { data } = await apiService.get(url);

      setCoupons(data.coupons);
      setTotalPages(data.totalPages);
      setPage(data.page);
      window.scrollTo(0, 0);
    } catch (error) {
      console.log(error);
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(null);
    }
  };

  const changePage = async (e, value) => {
    try {
      setLoading('Carregando...');
      
      const params = new URLSearchParams();
      params.set('page', value);
      
      if (filter.status) {
        params.set('status', filter.status);
      }
      if (filter.searchTerm) {
        params.set('search', filter.searchTerm);
      }
      
      navigate(`/coupons?${params.toString()}`, { replace: true });
    } catch (error) {
      toast.error('Erro ao mudar página');
      setLoading(null);
    }
  };

  const deleteCoupon = async (id) => {
    handleCloseConfirm();
    try {
      setLoading('Excluindo...');
      await apiService.delete(`/admin/coupons/${id}`);
      toast.success('Cupom excluído com sucesso!');
      getCoupons();
    } catch (e) {
      toast.error('Erro ao excluir cupom');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpenConfirm = (id) => {
    setItemToDelete(id);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setItemToDelete(null);
    setOpenConfirm(false);
  };

  const toUpdate = (id) => navigate('/coupons/update/' + id);

  const getFilters = async (filter) => {
    setFilter(filter);
    const params = new URLSearchParams();
    const currentPage = searchParams.get('page') || '1';
    params.set('page', currentPage);
    
    if (filter.status !== undefined && filter.status !== '') {
      params.set('status', filter.status);
    }
    
    if (filter.searchTerm) {
      params.set('search', filter.searchTerm);
    }
    
    navigate(`/coupons?${params.toString()}`, { replace: true });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const isActive = (coupon) => {
    if (!coupon.isActive) return false;
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    return now >= validFrom && now <= validUntil;
  };

  useEffect(() => {
    getCoupons();
  }, [filter, searchParams]);

  return (
    <Box sx={{ width: '100%' }}>
      <Header
        title="Cupons de Desconto"
        buttonText="Novo cupom"
        buttonClick={() => navigate('create')}
        back={-1}
      />

      <Filter
        filters={filters}
        onApplyFilters={getFilters}
      />

      <S.ContainerCoupons>
        {coupons.length === 0 ? (
          <S.EmptyState>
            <Typography variant="h6" color="text.secondary">
              Nenhum cupom cadastrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Clique em "Novo cupom" para criar um cupom de desconto
            </Typography>
          </S.EmptyState>
        ) : (
          <Grid container spacing={3}>
            {coupons.map((coupon) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={coupon._id}>
                <S.CardCustom>
                  <Box sx={{ position: 'relative' }}>
                    <S.CardMediaWrapper className="card-media-wrapper">
                      <S.CouponCodeDisplay>
                        {coupon.code}
                      </S.CouponCodeDisplay>
                      <S.OverlayActions className="overlay-actions">
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
                                  onClick={() => {
                                    toUpdate(coupon._id);
                                    popupState.close();
                                  }}
                                  sx={{ gap: 1 }}
                                >
                                  <EditIcon fontSize="small" color="primary" />
                                  Editar
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    handleClickOpenConfirm(coupon._id);
                                    popupState.close();
                                  }}
                                  sx={{ gap: 1, color: 'error.main' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                  Excluir
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </PopupState>
                      </S.OverlayActions>
                      <S.StatusBadge>
                        <Chip
                          icon={isActive(coupon) ? <CheckCircleIcon /> : <CancelIcon />}
                          label={isActive(coupon) ? 'Ativo' : isExpired(coupon.validUntil) ? 'Expirado' : 'Inativo'}
                          size="small"
                          color={isActive(coupon) ? 'success' : 'default'}
                          sx={{ 
                            fontWeight: 600,
                            boxShadow: 2
                          }}
                        />
                      </S.StatusBadge>
                    </S.CardMediaWrapper>
                  </Box>

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
                        {coupon.name}
                      </Typography>
                      
                      {coupon.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 1.5,
                            fontSize: '0.875rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {coupon.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Desconto:
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700,
                              color: 'primary.main',
                              fontSize: '1.25rem'
                            }}
                          >
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}%` 
                              : coupon.discountValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Tipo:
                          </Typography>
                          <Chip 
                            label={coupon.discountType === 'percentage' ? 'Percentual' : 'Valor Fixo'} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>

                        {coupon.minOrderValue > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Valor mínimo: {coupon.minOrderValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </Typography>
                        )}

                        {coupon.usageLimit && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Usos: {coupon.usageCount} / {coupon.usageLimit}
                          </Typography>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Válido até: {formatDate(coupon.validUntil)}
                        </Typography>
                      </Box>
                    </Box>
                  </S.CardContentCustom>
                </S.CardCustom>
              </Grid>
            ))}
          </Grid>
        )}

        {coupons.length > 0 && totalPages > 1 && (
          <Pagination
            sx={{ display: 'flex', justifyContent: 'center', p: '32px' }}
            color="primary"
            count={totalPages}
            page={page}
            onChange={changePage}
          />
        )}
      </S.ContainerCoupons>

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancelar</Button>
          <Button onClick={() => deleteCoupon(itemToDelete)} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <BackdropLoading loading={loading} />
    </Box>
  );
};

export default Index;

