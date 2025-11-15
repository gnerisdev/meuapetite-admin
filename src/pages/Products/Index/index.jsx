import React, { useState, useEffect, useContext } from 'react';
import { EditIcon, ContentCopyIcon, DeleteIcon, MoreVertIcon, CheckCircleIcon, CancelIcon } from 'components/icons';
import { useNavigate } from 'react-router-dom';
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
import { ApiService } from 'services/api.service';
import { GlobalContext } from 'contexts/Global';
import Header from 'components/Header';
import BackdropLoading from 'components/BackdropLoading';
import Filter from 'components/Filter';
import * as S from './style';


const filters = [
  {
    name: 'searchTerm',
    label: 'Buscar por produto',
    placeholder: 'Buscar produtos...',
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

const Index = () => {
  const apiService = new ApiService();
  const navigate = useNavigate();
  const { toast, company } = useContext(GlobalContext);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filter, setFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const getProducts = async () => {
    try {
      setLoading('Carregando...');

      let url = `/admin/products?page=1`;

      if (filter.status) {
        url += `&status=${encodeURIComponent(filter.status)}`;
      }

      if (filter.searchTerm) {
        url += `&search=${encodeURIComponent(filter.searchTerm)}`;
      }

      if (filter.category) {
        url += `&filterCategory=${encodeURIComponent(filter.category)}`;
      }

      const { data } = await apiService.get(url);

      setProducts(data.products);
      setTotalPages(data.totalPages);
      setPage(data.page);
      window.scrollTo(0, 0);
    } catch (error) {
      console.log(error);
      toast.error('Não foi possível obter os produtos');
    } finally {
      setLoading(null);
    }
  };

  const changePage = async (e, value) => {
    try {
      setLoading('Carregando...');
      const { data } = await apiService.get(`/admin/products?page=${value}`);

      setProducts(data.products);
      setTotalPages(data.totalPages);
      setPage(data.page);
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error('Não foi possível mudar de página');
    } finally {
      setLoading(null);
    }
  };

  const deleteProduct = async (id) => {
    handleCloseConfirm();
    try {
      setLoading('Aguarde...');
      const { data } = await apiService.delete(`/admin/products/${id}/${company._id}/${page}`);
      setProducts(data.products);
      toast.success('Produto excluído!');
    } catch (e) {
      toast.error('Não foi possível excluir o produto!');
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

  const toUpdate = (id) => navigate('/products/update/' + id);

  const toDuplicate = (product) => {
    return navigate('/products/create/', { state: { product, duplicate: true } });
  };

  const getCategories = async () => {
    try {
      const response = await apiService.get('/admin/categories');
      setCategories(response.data);
    } catch (e) { }
  };

  const getFilters = async (filter) => setFilter(filter);

  useEffect(() => {
    getProducts();
  }, [filter]);

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Header
        title="Produtos"
        buttonText="Novo produto"
        buttonClick={() => navigate('create')}
        back={-1}
      />

      <Filter
        filters={[
          ...filters,
          {
            name: 'category',
            label: 'Categoria',
            placeholder: 'Todas categoria',
            type: 'select',
            options: categories.map(item => 
              ({ value: item._id, label: item.title })
            )
          }
        ]}
        onApplyFilters={getFilters}
      />

      <S.ContainerProducts>
        <Grid container spacing={3}>
          {products.map((item, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={'index-' + i}>
              <S.CardCustom>
                <Box sx={{ position: 'relative' }}>
                  <S.CardMediaWrapper className="card-media-wrapper">
                    <S.CardMediaCustom 
                      image={item.images.length ? item.images[0].url : '/placeholder-image.jpg'} 
                      title={item.name}
                    />
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
                                  toUpdate(item._id);
                                  popupState.close();
                                }}
                                sx={{ gap: 1 }}
                              >
                                <EditIcon fontSize="small" color="primary" />
                                Editar
                              </MenuItem>
                              <MenuItem 
                                onClick={() => {
                                  toDuplicate(item);
                                  popupState.close();
                                }}
                                sx={{ gap: 1 }}
                              >
                                <ContentCopyIcon fontSize="small" color="action" />
                                Duplicar
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  handleClickOpenConfirm(item._id);
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
                        icon={item.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                        label={item.isActive ? 'Ativo' : 'Inativo'}
                        size="small"
                        color={item.isActive ? 'success' : 'default'}
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
                      {item.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Preço:
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            color: 'primary.main',
                            fontSize: '1.25rem'
                          }}
                        >
                          {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </Box>
                      
                      {item.category?.title && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Categoria:
                          </Typography>
                          <Chip 
                            label={item.category.title} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </S.CardContentCustom>
              </S.CardCustom>
            </Grid>
          ))}
        </Grid>
      </S.ContainerProducts>

      {products.length > 0 &&
        <Pagination
          sx={{ display: 'flex', justifyContent: 'center', p: '32px' }}
          color="primary"
          count={totalPages}
          page={page}
          onChange={changePage}
        />
      }

      {products.length === 0 && (
        <S.EmptyState>
          <Box sx={{ fontSize: '4rem', mb: 2, opacity: 0.5 }}>
            📦
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            Nenhum produto encontrado
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: '400px' }}>
            Não há produtos cadastrados no momento. Para adicionar um novo produto, clique no botão "Novo produto" acima.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('create')}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Criar primeiro produto
          </Button>
        </S.EmptyState>
      )}

      <Dialog 
        open={openConfirm} 
        onClose={handleCloseConfirm}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 1
        }}>
          <DeleteIcon color="error" />
          Excluir produto?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.95rem' }}>
            Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleCloseConfirm}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => deleteProduct(itemToDelete)} 
            variant="contained"
            color="error"
            autoFocus
            sx={{ textTransform: 'none' }}
            startIcon={<DeleteIcon />}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <BackdropLoading loading={loading} />
    </Box>
  );
};

export default Index;