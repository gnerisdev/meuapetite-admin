import React, { useEffect, useState } from 'react';
import { FormControl, Grid, InputAdornment, InputLabel, OutlinedInput, TextField, Autocomplete } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { ApiService } from 'services/api.service';
import { propsTextField } from 'utils/form';
import imageDefault from 'assets/images/default-placeholder.png';
import * as S from './style';

const FormProduct = (props) => {
  const apiService = new ApiService();
  const { state } = useLocation();
  const [categories, setCategories] = useState([]);
  const [categoryInputValue, setCategoryInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [data, setData] = useState({
    name: '',
    description: '',
    price: 0,
    priceFormat: '',
    discountPrice: 0,
    discountPriceFormat: '',
    category: '',
    categoryName: '',
    images: [],
  });
  const [imageCurrent, setImageCurrent] = useState(null);

  const loadImage = async (e) => {
    if (e.target.files.length <= 0) return;
    setImageCurrent(URL.createObjectURL(e.target.files[0]));
    setData((prevData) => {
      const newData = { ...prevData, images: [e.target.files[0]] };
      props.getData(newData);
      return newData;
    });
  };

  const removeImage = () => {
    setData((prevData) => {
      const newData = { ...prevData, images: [] };
      props.getData(newData);
      return newData;
    });
    setImageCurrent(null);
  };

  const getCategories = async () => {
    try {
      const response = await apiService.get('/admin/categories');
      setCategories(response.data);
    } catch (e) {}
  };

  const handleCategoryChange = async (event, newValue, reason) => {
    if (!newValue) {
      // Limpar seleção
      setSelectedCategory(null);
      setCategoryInputValue('');
      setData((prevData) => {
        const newData = { ...prevData, category: '', categoryName: '' };
        props.getData(newData);
        return newData;
      });
      return;
    }

    // Se é uma string, é uma nova categoria
    if (typeof newValue === 'string') {
      const categoryName = newValue.trim();
      if (categoryName) {
        setSelectedCategory({ title: categoryName, _id: null });
        setCategoryInputValue(categoryName);
        setData((prevData) => {
          const newData = { ...prevData, category: '', categoryName: categoryName };
          props.getData(newData);
          return newData;
        });
      }
    } 
    // Se é um objeto com _id, é uma categoria existente
    else if (newValue._id) {
      setSelectedCategory(newValue);
      setCategoryInputValue(newValue.title);
      setData((prevData) => {
        const newData = { ...prevData, category: newValue._id, categoryName: newValue.title };
        props.getData(newData);
        return newData;
      });
    }
    // Se é um objeto sem _id, é uma nova categoria digitada
    else if (newValue.title) {
      setSelectedCategory(newValue);
      setCategoryInputValue(newValue.title);
      setData((prevData) => {
        const newData = { ...prevData, category: '', categoryName: newValue.title };
        props.getData(newData);
        return newData;
      });
    }
  };

  const maskFormat = (data) => {
    const numericString = data.replace(/[^\d]/g, '');
    const number = parseFloat(numericString);
    if (isNaN(number)) return '0.00';
    return (number / 100).toFixed(2);
  };

  const handleInputChange = (fieldName, value) => {
    setData((prevData) => {
      const newData = { ...prevData, [fieldName]: value };
      props.getData(newData);
      return newData;
    });
  };
  
  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    const data = props?.initialData ? props.initialData : props.data;
    
    if (data) {
    if (data?.images?.[0] instanceof File) {
        setImageCurrent(URL.createObjectURL(data.images[0]));
    } else if(data?.images?.[0]) {
        setImageCurrent(data.images[0]);
      }

      // Se há uma categoria selecionada, encontrar o objeto completo
      if (data?.category) {
        const categoryObj = categories.find(c => c._id === data.category);
        if (categoryObj) {
          setSelectedCategory(categoryObj);
          setCategoryInputValue(categoryObj.title);
        }
      } else if (data?.categoryName) {
        setCategoryInputValue(data.categoryName);
        setSelectedCategory({ title: data.categoryName, _id: null });
      }

      setData(data);
      if (data) {
        props.getData(data);
      }
    }
  }, [categories, props.data, props.initialData]);

  return (
    <Grid container spacing={2} sx={{ mt: '1rem' }}>
      <S.wrapperIntro>
        <S.WrapperUpload>
          {data?.images?.length >= 1 && (
            <span className="fa fa-close close" onClick={removeImage}></span>
          )}
          <label>
            {!imageCurrent && <button>clique aqui para add imagem</button>}
            <input accept="image/*" onChange={loadImage} type="file" />
            <S.ImageProduct src={imageCurrent || imageDefault} />
          </label>
        </S.WrapperUpload>
        <Grid item sm={12} sx={{ display: 'grid', gap: '1rem', m: 0 }}>
          <TextField
            {...propsTextField}
            label="Nome"
            required={true}
            value={data.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          <TextField
            {...propsTextField}
            label="Descrição"
            multiline
            rows={3}
            value={data.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </Grid>
      </S.wrapperIntro>
      <Grid item xs={6} sx={{ display: 'flex', alignItems: 'end', mb: '4px', mt: '10px' }}>
        <FormControl fullWidth>
          <InputLabel>Preço</InputLabel>
          <OutlinedInput
            startAdornment={<InputAdornment position="start">R$</InputAdornment>}
            label="Preço"
            value={data.price}
            onChange={(e) => handleInputChange('price', maskFormat(e.target.value))}
          />
        </FormControl>
      </Grid>
      <Grid item xs={6} sx={{ display: 'flex', alignItems: 'end', mb: '4px' }}>
        <FormControl fullWidth>
          <InputLabel>Preço com desconto</InputLabel>
          <OutlinedInput
            startAdornment={<InputAdornment position="start">R$</InputAdornment>}
            label="Preço com desconto"
            value={data.discountPrice}
            onChange={(e) =>
              handleInputChange('discountPrice', maskFormat(e.target.value))
            }
          />
        </FormControl>
      </Grid>

      <Grid item xs={12} sx={{ mt: 1.1, mb: 1.1 }}>
        <Autocomplete
          freeSolo
          options={categories}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return option.title || '';
          }}
          value={selectedCategory}
          inputValue={categoryInputValue}
          onInputChange={(event, newInputValue, reason) => {
            // Atualizar o valor do input
            setCategoryInputValue(newInputValue);
            
            // Só atualizar os dados se o usuário estiver digitando (não quando selecionar)
            if (reason === 'input') {
              const trimmedValue = newInputValue.trim();
              if (trimmedValue) {
                // Verificar se é uma categoria existente (comparação case-insensitive)
                const existingCategory = categories.find(c => 
                  c.title.toLowerCase() === trimmedValue.toLowerCase()
                );
                
                if (existingCategory) {
                  // Se encontrou uma categoria existente, usar ela
                  setSelectedCategory(existingCategory);
                  setData((prevData) => {
                    const newData = { 
                      ...prevData, 
                      category: existingCategory._id, 
                      categoryName: existingCategory.title 
                    };
                    props.getData(newData);
                    return newData;
                  });
                } else {
                  // Se não encontrou, é uma nova categoria
                  setSelectedCategory({ title: trimmedValue, _id: null });
                  setData((prevData) => {
                    const newData = { 
                      ...prevData, 
                      category: '', 
                      categoryName: trimmedValue 
                    };
                    props.getData(newData);
                    return newData;
                  });
                }
              } else {
                // Se o campo está vazio, limpar
                setSelectedCategory(null);
                setData((prevData) => {
                  const newData = { ...prevData, category: '', categoryName: '' };
                  props.getData(newData);
                  return newData;
                });
              }
            }
          }}
          onChange={handleCategoryChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categoria"
              required
              placeholder="Selecione ou digite para criar nova categoria"
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option._id || option.title}>
              {option.title}
            </li>
          )}
          isOptionEqualToValue={(option, value) => {
            if (!value) return false;
            if (option._id && value._id) {
              return option._id === value._id;
            }
            if (typeof value === 'string') {
              return option.title === value;
            }
            return option.title === value.title;
          }}
        />
      </Grid>
    </Grid>
  );
};

export default FormProduct;
