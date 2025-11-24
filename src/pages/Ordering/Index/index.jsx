import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch, Menu, Box, IconButton, Button, Tooltip } from '@mui/material';
import { MoreVertIcon } from 'components/icons';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';
import * as S from './style';

const Index = () => {
  const label = { inputProps: { 'aria-label': 'Color switch demo' } };
  const navigate = useNavigate();
  const apiService = new ApiService();
  const { toast } = useContext(GlobalContext);
  const [categories, setCategories] = useState([]);
  const [categoryChanges, setCategoryChanges] = useState([]);
  const [productChangeCurrent, setProductChangeCurrent] = useState(-1);
  const [categoryChangeCurrent, setCategoryChangeCurrent] = useState(-1);
  const [loading, setLoading] = useState(false);

  // Categorias
  const getCategories = async () => {
    try {
      setLoading('Carregando categorias...');
      const response = await apiService.get('/admin/categoriesWithProducts');
      if (response.data && Array.isArray(response.data)) {
        sortPosition(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addCategoryChanges = (indexs) => {
    indexs.forEach((i) => {
      if (categoryChanges?.indexOf(i) === -1) {
        setCategoryChanges((prev) => [...prev, i]);
      }
    });
  };

  const sortPosition = (data) => {
    const sortedData = data.map((item) => {
      const sortedProducts = [...item.products].sort((a, b) => {
        const posA = a.displayPosition || 0;
        const posB = b.displayPosition || 0;
        return posA - posB;
      });
      return {
        ...item,
        products: sortedProducts
      };
    });
    setCategories(sortedData);
  };

  const changeProductPosition = (indexCategory, indexProduct, action) => {
    const categoriesCopy = [...categories];
    const products = [...categoriesCopy[indexCategory].products];
    let currentPosition = products[indexProduct].displayPosition;

    if (action === 'up') {
      if (indexProduct === 0) return;
      if (products[indexProduct].displayPosition === 1) return;
      products[indexProduct].displayPosition = products[indexProduct - 1].displayPosition;
      products[indexProduct - 1].displayPosition = currentPosition;
      setProductChangeCurrent(products[indexProduct]._id);
      setTimeout(() => setProductChangeCurrent(-1), 500);
    } else if (action === 'down') {
      if (indexProduct === products.length - 1) return;
      products[indexProduct].displayPosition = products[indexProduct + 1].displayPosition;
      products[indexProduct + 1].displayPosition = currentPosition;
      setProductChangeCurrent(products[indexProduct]._id);
      setTimeout(() => setProductChangeCurrent(-1), 500);
    }

    categoriesCopy[indexCategory].products = products.sort((a, b) => {
      const posA = a.displayPosition || 0;
      const posB = b.displayPosition || 0;
      return posA - posB;
    });
    addCategoryChanges([indexCategory]);
    setCategories(categoriesCopy);
  };

  const changeProductStatus = (indexCategory, indexProduct) => {
    const updatedCategories = [...categories];
    const updatedCategory = { ...updatedCategories[indexCategory] };
    const updatedProducts = [...updatedCategory.products];
    const updatedProduct = { ...updatedProducts[indexProduct] };
    updatedProduct.isActive = !updatedProduct.isActive;
    updatedProducts[indexProduct] = updatedProduct;
    updatedCategory.products = updatedProducts;
    updatedCategories[indexCategory] = updatedCategory;
    setCategories(updatedCategories);
    addCategoryChanges([indexCategory]);
  };

  const changeCategoriesPosition = (index, action) => {
    if (index === categories.length - 1 && action === 'down') return;
    if (index === 0 && action === 'up') return;

    const categoriesCopy = [...categories];
    const category = categoriesCopy[index];
    let currentPosition = category.displayPosition;

    if (action === 'up') {
      category.displayPosition = categoriesCopy[index - 1]['displayPosition'];
      categoriesCopy[index - 1]['displayPosition'] = currentPosition;
      addCategoryChanges([index, index - 1]);
      setCategoryChangeCurrent(category._id);
      setTimeout(() => setCategoryChangeCurrent(-1), 500);
    } else if (action === 'down') {
      category.displayPosition = categoriesCopy[index + 1]['displayPosition'];
      categoriesCopy[index + 1]['displayPosition'] = currentPosition;
      addCategoryChanges([index, index + 1]);
      setCategoryChangeCurrent(category._id);
      setTimeout(() => setCategoryChangeCurrent(-1), 500);
    }

    setCategories(categoriesCopy.sort((a, b) => a.displayPosition - b.displayPosition));
  };

  const changeCategoryStatus = (index) => {
    const categoriesCopy = [...categories];
    categoriesCopy[index]['isActive'] = !categoriesCopy[index]['isActive'];
    setCategories(categoriesCopy);
    addCategoryChanges([index]);
  };

  const saveCategories = async () => {
    try {
      setLoading('Atualizando categorias...');
      const data = categories.filter((item, i) => {
        return categoryChanges.indexOf(i) >= 0;
      });
      
      if (data.length === 0) {
        toast.info('Nenhuma alteração para salvar');
        setLoading(false);
        return;
      }
      
      const response = await apiService.put('/admin/categories', data);
      if (response.data && Array.isArray(response.data)) {
        sortPosition(response.data);
      }
      setCategoryChanges([]);
      toast.success('Categorias atualizadas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <>
      <Header title="Ordenação" back={-1}b/>

      <S.ContainerCategories>
        {categories.map((item, indexCat) => (
          <S.ContainerCategory 
            key={item._id || item.title}
            style={{
              background: categoryChangeCurrent === item._id 
                ? 'rgba(52, 152, 219, 0.1)' : ''
            }}
          >
            <S.HeaderCategory>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PopupState variant="popover" popupId={`category-menu-${indexCat}`}>
                  {(popupState) => (
                    <>
                      <IconButton sx={{ p: 0, m: 0 }} {...bindTrigger(popupState)}>
                        <MoreVertIcon sx={{ fontSize: '20px' }} />
                      </IconButton>
                      <Menu {...bindMenu(popupState)}>
                        <S.MenuItemCuston onClick={() => {
                          popupState.close();
                          navigate('/categories/update/' + item._id)
                        }}>
                          <span className="fa fa-edit"></span> Editar
                        </S.MenuItemCuston>
                      </Menu>
                    </>
                  )}
                </PopupState>
                <strong>{item.displayPosition}º</strong> {item.title}
              </Box>
              <div className="actions">
                <div className="move">
                  <Tooltip title="Mover para baixo">
                    <Button
                      variant="outlined"
                      size="small"
                      className="btnDown"
                      onClick={() => changeCategoriesPosition(indexCat, 'down')}
                      disabled={indexCat === categories.length - 1}
                      sx={{ minWidth: '40px', p: 0.5 }}
                    >
                      <span className="fa fa-chevron-down"></span>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Mover para cima">
                    <Button
                      variant="outlined"
                      size="small"
                      className="btnUp"
                      onClick={() => changeCategoriesPosition(indexCat, 'up')}
                      disabled={indexCat === 0}
                      sx={{ minWidth: '40px', p: 0.5 }}
                    >
                      <span className="fa fa-chevron-up"></span>
                    </Button>
                  </Tooltip>
                  <Tooltip title={item.isActive ? "Desativar categoria" : "Ativar categoria"}>
                    <Switch
                      {...label}
                      checked={item.isActive}
                      onChange={() => changeCategoryStatus(indexCat)}
                    />
                  </Tooltip>
                </div>
              </div>
            </S.HeaderCategory>
            <S.BodyCategory>
              {item.products && item.products.length > 0 ? item.products.map((product, indexProduct) => (
                <S.CategoryItem
                  key={product._id || indexProduct}
                  style={{
                    background: productChangeCurrent === product._id 
                      ? 'rgba(52, 152, 219, 0.1)' : '',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <div className="wrapperInfo">
                    <strong>{product.displayPosition}º</strong>
                    <img
                      className="imageItem"
                      src={product.images[0]?.url}
                      alt={`Imagem do produto ${product.name}`}
                    />
                    <p className="nameItem">{product.name}</p>
                  </div>
                  <div className="action">
                    <div className="move">
                      <Tooltip title="Mover produto para baixo">
                        <Button
                          variant="outlined"
                          size="small"
                          className="btnDown"
                          onClick={() => changeProductPosition(indexCat, indexProduct, 'down')}
                          disabled={indexProduct === item.products.length - 1}
                          sx={{ minWidth: '40px', p: 0.5 }}
                        >
                          <span className="fa fa-chevron-down"></span>
                        </Button>
                      </Tooltip>
                      <Tooltip title="Mover produto para cima">
                        <Button
                          variant="outlined"
                          size="small"
                          className="btnUp"
                          onClick={() => changeProductPosition(indexCat, indexProduct, 'up')}
                          disabled={indexProduct === 0}
                          sx={{ minWidth: '40px', p: 0.5 }}
                        >
                          <span className="fa fa-chevron-up"></span>
                        </Button>
                      </Tooltip>
                    </div>
                    <Tooltip title={product.isActive ? "Desativar produto" : "Ativar produto"}>
                      <Switch
                        {...label}
                        checked={product.isActive}
                        onChange={() => changeProductStatus(indexCat, indexProduct)}
                      />
                    </Tooltip>
                  </div>
                </S.CategoryItem>
              )) : (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  Nenhum produto nesta categoria
                </Box>
              )}
            </S.BodyCategory>
          </S.ContainerCategory>
        ))}

        {categories.length ? (
          <Box sx={{ mb: '48px' }}>
            <ButtonFloat 
              text={'Salvar Ordenação'} 
              onClick={saveCategories}
              disabled={categoryChanges.length === 0}
            />
          </Box>
        ) : null}
      </S.ContainerCategories>

      {!categories.length && (
        <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
          Não há categorias cadastradas no momento.
        </Box>
      )}

      <BackdropLoading loading={loading} />
    </>
  );
}

export default Index;