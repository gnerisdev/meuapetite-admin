import { useContext, useEffect, useState } from 'react';
import { Tab, Tabs, Box } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalContext } from 'contexts/Global';
import { ApiService } from 'services/api.service';
import Header from 'components/Header';
import ComplementProduct from 'components/ComplementProduct';
import FormProduct from 'components/FormProduct';
import ButtonFloat from 'components/ButtonFloat';
import BackdropLoading from 'components/BackdropLoading';

const Update = () => {
  const apiService = new ApiService();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useContext(GlobalContext);
  const [tabCurrent, setTabCurrent] = useState(0);
  const [complements, setComplements] = useState([]);
  const [complementsErrors, setComplementsErrors] = useState([]);
  const [dataProduct, setDataProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const getProduct = async () => {
    try {
      setLoading('Buscando produto...');
      const { data } = await apiService.get('/admin/products/' + id);
      setDataProduct({
        name: data.name,
        description: data.description || '',
        price: data.price,
        discountPrice: data.discountPrice || 0,
        category: data.category._id,
        categoryName: data.category.title,
        images: data.images[0] ? [{ url: data.images[0]?.url, id: data.images[0]?.id }] : [],
      });
      setComplements(data.complements);
    } catch (error) {
      toast.error('Erro ao buscar o produto');
    } finally {
      setLoading(false);
    }
  };

  const validateData = () => {
    const errors = [];

    if (dataProduct.images.length <= 0) errors.push('Imagem é obrigatório');
    if (!dataProduct.name.trim().length) errors.push('Nome é obrigatório');
    if (isNaN(Number(dataProduct.price))) errors.push('Preço é obrigatório');
    if (!isNaN(Number(dataProduct.price))) {
      if (dataProduct.price <= 0) errors.push('Preço deve ser maior que zero');
    } 
    if (dataProduct.discountPrice && !dataProduct.discountPrice > 0) errors.push('Preço do desconto inválido');
    
    // Validar categoria
    const hasCategoryId = dataProduct.category && (typeof dataProduct.category === 'string' ? dataProduct.category.trim().length > 0 : true);
    const hasCategoryName = dataProduct.categoryName && typeof dataProduct.categoryName === 'string' && dataProduct.categoryName.trim().length > 0;
    if (!hasCategoryId && !hasCategoryName) {
      errors.push('Categoria é obrigatório');
    }
    if (errors.length <= 0) return true;

    toast.error(errors.map(error => `• ${error}.`).join('\n'));
    return false;
  };

  const handleSubmit = async () => {
    if (!validateData()) return;
    if (complements.length) {
      if (complementsErrors.length) return toast.error(complementsErrors.join('\n\n'));
    }

    setLoading('Salvando...');

    try {
      const formData = new FormData();
      formData.append('name', dataProduct.name);
      formData.append('description', dataProduct.description);
      formData.append('price', dataProduct.price);
      formData.append('discountPrice', dataProduct.discountPrice);
      formData.append('isActive', true);
      formData.append('category', dataProduct.category || '');
      if (dataProduct.categoryName) {
        formData.append('categoryName', dataProduct.categoryName);
      }
      
      // Se a imagem é um File, é uma nova imagem
      if (dataProduct.images[0] instanceof File) {
        formData.append('images', dataProduct.images[0]);
      } else if (dataProduct.images[0]?.id) {
        // Se é um objeto com id, enviar o id para manter a imagem existente
        formData.append('imageId', dataProduct.images[0].id);
      }
      
      formData.append('complements', JSON.stringify(complements));

      await apiService.put(`/admin/products/${id}`, formData, true);

      toast.success('Produto atualizado!');
      setTimeout(() => {navigate({ pathname: '/products' }); }, 2000);
    } catch (e) {
      toast.error(e.response.data?.message || 'Erro ao atualizar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, newValue) => setTabCurrent(newValue);

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <Box component="section">
    <Header title="Editar produto" back={-1} />

    <Tabs value={tabCurrent} onChange={handleChange} variant="scrollable" >
      <Tab label="Detalhes" />
      <Tab label="Complementos" />
    </Tabs>

    <Box component="section" sx={{ mb: '48px' }}>
    {tabCurrent === 0 ? (
          dataProduct
          && <FormProduct 
              data={dataProduct} 
              getData={data => setDataProduct(data)} 
            />
        ) : (
          <section style={{ marginTop: '1rem' }}>
            <ComplementProduct
              complementsValue={complements}
              getValue={(value, errors) => {
                setComplements(value);
                setComplementsErrors(errors);
              }}
            />
          </section>
        )}
    </Box>
    <ButtonFloat text="Salvar" onClick={() => handleSubmit()} />

    <BackdropLoading loading={loading} />
  </Box>
  );
};

export default Update;
