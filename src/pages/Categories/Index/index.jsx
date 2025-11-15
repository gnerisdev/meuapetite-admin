import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch, Button,  Menu, Box, IconButton } from '@mui/material';
import { MoreVertIcon } from 'components/icons';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Header from 'components/Header';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';
import * as S from './style';

const Index = () =>  {
  const label = { inputProps: { 'aria-label': 'Color switch demo' } };

  const navigate = useNavigate();
  const apiService = new ApiService();
  const { toast } = useContext(GlobalContext);
  const [categories, setCategories] = useState([]);
  const [categoryChanges, setCategoryChanges] = useState([]);
  const [productChangeCurrent, setProductChangeCurrent] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const getCategories = async () => {
    const response = await apiService.get('/admin/categoriesWithProducts');
    setCategories([]);
    sortPosition(response.data);
  };

  const addCategorychanges = (indexs) => {
    indexs.forEach((i) => {
      if (categoryChanges?.indexOf(i) === -1) {
        setCategoryChanges((prev) => [...prev, i]);
      }
    });
  };

  const sortPosition = (data) => {
    //{ products: { displayPosition: number }[], title: string) } []
    data.forEach((item) => {
      const itemCurrent = item;
      const result = itemCurrent.products.sort((a, b) => a.displayPosition - b.displayPosition);
      itemCurrent.products = result;
      setCategories((prev) => [...prev, itemCurrent]);
    });
  };

  const changeProductPosition = (indexCategory, indexProduct, action) => {
    const positions = [];
    const categoriesCurrent = categories;
    const products = categoriesCurrent[indexCategory]['products'];
    let currentPosition = products[indexProduct]['displayPosition'];

    if (action === 'up') {
      if (products[indexProduct]['displayPosition'] === 1) return;
      products[indexProduct]['displayPosition'] = products[indexProduct - 1]['displayPosition'];
      products[indexProduct - 1]['displayPosition'] = currentPosition;
      positions.push(indexProduct, (indexProduct - 1));
      setProductChangeCurrent(products[indexProduct]._id);
    } else if (action === 'down') {
      products[indexProduct]['displayPosition'] = products[indexProduct + 1]['displayPosition'];
      products[indexProduct + 1]['displayPosition'] = currentPosition;
      positions.push(indexProduct, (indexProduct + 1));
      setProductChangeCurrent(products[indexProduct]._id);
    }

    categoriesCurrent[indexCategory]['products'] = products;
    addCategorychanges([indexCategory]);
    setCategories([]);
    sortPosition(categoriesCurrent);
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
    addCategorychanges([indexCategory]);
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
      addCategorychanges([index, index - 1]);
    } else if (action === 'down') {
      category.displayPosition = categoriesCopy[index + 1]['displayPosition'];
      categoriesCopy[index + 1]['displayPosition'] = currentPosition;
      addCategorychanges([index, index + 1]);
    }

    setCategories(categoriesCopy.sort((a, b) => a.displayPosition - b.displayPosition));
  };

  const changeStatus = (index) => {
    const categoriesCopy = [...categories];
    categoriesCopy[index]['isActive'] = !categoriesCopy[index]['isActive'];
    setCategories(categoriesCopy);
    addCategorychanges([index]);
  };

  const openCreateProduct = (id) => navigate('/products/create', { state: { categoryId: id } });

  const save = async () => {
    try {
      setLoading('Atualizando...');

      const data = categories
        .filter((item, i) => {
          if (categoryChanges.indexOf(i) >= 0) return item;
        });
      const response = await apiService.put('/admin/categories', data);

      setCategories([]);
      sortPosition(response.data);
      toast.success('Mudanças feitas com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer mudanças');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id, popupState) => {
    popupState.close();

    try {
      setLoading('Atualizando');
      const response = await apiService.delete('/admin/categories/' + id);
      setCategories([]);
      sortPosition(response.data);
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      toast.error(error.response.data?.message || 'Não foi possível excluir a categoria');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <>
      <Header
        title="Categorias"
        buttonText="Nova categoria"
        buttonClick={() => navigate('create')}
        back={-1}
      />

      <S.ContainerCategories>
        {categories.map((item, indexCat) => (
          <S.ContainerCategory key={item.title}>
            <S.HeaderCategory>
              <Box sx={{ display: 'flex' }}>
                <PopupState variant="popover" popupId="demo-popup-menu">
                  {(popupState) => (
                    <>
                      <IconButton sx={{ p: 0, m: 0 }} {...bindTrigger(popupState)}>
                        <MoreVertIcon sx={{ fontSize: '20px', ml: -1 }} />
                      </IconButton>
                      <Menu {...bindMenu(popupState)}>
                        <S.MenuItemCuston onClick={() => {
                          popupState.close();
                          navigate('/categories/update/' + item._id)
                        }}>
                          <span className="fa fa-edit"></span> Editar
                        </S.MenuItemCuston>
                        <S.MenuItemCuston onClick={() => remove(item._id, popupState)}>
                          <span className="fa fa-remove"></span> Excluir
                        </S.MenuItemCuston>
                      </Menu>
                    </>
                  )}
                </PopupState>
                {item.title}
              </Box>
              <div className="actions">
                <div className="move">
                  <span
                    className="fa fa-angle-down btnDown"
                    onClick={() => changeCategoriesPosition(indexCat, 'down')}
                  />
                  <span
                    className="fa fa-angle-up btnUp"
                    onClick={() => changeCategoriesPosition(indexCat, 'up')}
                  />
                  <Switch
                    {...label}
                    checked={item.isActive}
                    onChange={() => changeStatus(indexCat)}
                  />
                </div>
              </div>
            </S.HeaderCategory>
            <S.BodyCategory>
              <Button
                sx={{ textTransform: 'none' }}
                onClick={() => openCreateProduct(item._id)}
              >
                + Adicionar produto
              </Button>
              {item.products.map((item, indexProduct) => (
                <S.CategoryItem
                  key={indexProduct}
                  style={{
                    background: productChangeCurrent === item._id 
                      ? 'rgba(52, 152, 219, 0.1)' : ''
                  }}
                >
                  <div className="wrapperInfo">
                    <strong>{item.displayPosition}º</strong>
                    <img
                      className="imageItem"
                      src={item.images[0]?.url}
                      alt={`Imagem do produto ${item.name}`}
                    />
                    <p className="nameItem">{item.name}</p>
                  </div>
                  <div className="action">
                    <div>
                      <span
                        className="fa fa-angle-down btnDown"
                        onClick={() => changeProductPosition(indexCat, indexProduct, 'down')}
                      />
                      <span
                        className="fa fa-angle-up btnUp"
                        onClick={() => changeProductPosition(indexCat, indexProduct, 'up')}
                      />
                    </div>
                    <Switch
                      {...label}
                      checked={item.isActive}
                      onChange={() => changeProductStatus(indexCat, indexProduct)}
                    />
                  </div>
                </S.CategoryItem>
              ))}
            </S.BodyCategory>
          </S.ContainerCategory>
        ))}

        {categories.length ? (
          <Box sx={{ mb: '48px' }} disabled={categoryChanges.length > 0 ? true : false}>
            <ButtonFloat text={'Salvar alterações'} onClick={save} />
          </Box>
        ) : null}
      </S.ContainerCategories>

      {!categories.length ? (
        <div style={{ textAlign: 'center' }}>
          Não há categorias cadastradas no momento. Para adicionar uma nova
          categoria, clique em 'Nova Categoria'.
        </div>
      ) : null}

      <BackdropLoading loading={loading} />
    </>
  );
}

export default Index;