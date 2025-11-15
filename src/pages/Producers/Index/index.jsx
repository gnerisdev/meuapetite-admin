import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch, Menu, Box, IconButton } from '@mui/material';
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
  const [producers, setProducers] = useState([]);
  const [producerChanges, setProducerChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const getProducers = async () => {
    try {
      const response = await apiService.get('/admin/producers');
      const sortedProducers = response.data.sort((a, b) => a.displayPosition - b.displayPosition);
      setProducers(sortedProducers);
    } catch (error) {
      toast.error('Erro ao carregar produtores');
    }
  };

  const addProducerChanges = (indexs) => {
    indexs.forEach((i) => {
      if (producerChanges?.indexOf(i) === -1) {
        setProducerChanges((prev) => [...prev, i]);
      }
    });
  };

  const changeProducersPosition = (index, action) => {
    if (index === producers.length - 1 && action === 'down') return;
    if (index === 0 && action === 'up') return;

    const producersCopy = [...producers];
    const producer = producersCopy[index];
    let currentPosition = producer.displayPosition;

    if (action === 'up') {
      producer.displayPosition = producersCopy[index - 1]['displayPosition'];
      producersCopy[index - 1]['displayPosition'] = currentPosition;
      addProducerChanges([index, index - 1]);
    } else if (action === 'down') {
      producer.displayPosition = producersCopy[index + 1]['displayPosition'];
      producersCopy[index + 1]['displayPosition'] = currentPosition;
      addProducerChanges([index, index + 1]);
    }

    setProducers(producersCopy.sort((a, b) => a.displayPosition - b.displayPosition));
  };

  const changeStatus = (index) => {
    const producersCopy = [...producers];
    producersCopy[index]['isActive'] = !producersCopy[index]['isActive'];
    setProducers(producersCopy);
    addProducerChanges([index]);
  };

  const save = async () => {
    try {
      setLoading('Atualizando...');

      const data = producers
        .filter((item, i) => {
          if (producerChanges.indexOf(i) >= 0) return item;
        });
      const response = await apiService.put('/admin/producers', data);

      setProducers(response.data);
      setProducerChanges([]);
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
      const response = await apiService.delete('/admin/producers/' + id);
      setProducers(response.data);
      toast.success('Produtor excluído com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível excluir o produtor');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducers();
  }, []);

  return (
    <>
      <Header
        title="Produtores"
        buttonText="Novo produtor"
        buttonClick={() => navigate('create')}
        back={-1}
      />

      <S.ContainerProducers>
        {producers.map((item, index) => (
          <S.ContainerProducer key={item._id}>
            <S.HeaderProducer>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PopupState variant="popover" popupId={`producer-menu-${index}`}>
                  {(popupState) => (
                    <>
                      <IconButton sx={{ p: 0, m: 0 }} {...bindTrigger(popupState)}>
                        <MoreVertIcon sx={{ fontSize: '20px' }} />
                      </IconButton>
                      <Menu {...bindMenu(popupState)}>
                        <S.MenuItemCuston onClick={() => {
                          popupState.close();
                          navigate('/producers/update/' + item._id)
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
                <Box>
                  <strong>{item.displayPosition}º</strong> {item.name}
                </Box>
              </Box>
              <div className="actions">
                <div className="move">
                  <span
                    className="fa fa-angle-down btnDown"
                    onClick={() => changeProducersPosition(index, 'down')}
                  />
                  <span
                    className="fa fa-angle-up btnUp"
                    onClick={() => changeProducersPosition(index, 'up')}
                  />
                  <Switch
                    {...label}
                    checked={item.isActive}
                    onChange={() => changeStatus(index)}
                  />
                </div>
              </div>
            </S.HeaderProducer>
            {item.description && (
              <S.BodyProducer>
                <p>{item.description}</p>
              </S.BodyProducer>
            )}
          </S.ContainerProducer>
        ))}

        {producers.length ? (
          <Box sx={{ mb: '48px' }}>
            <ButtonFloat 
              text={'Salvar alterações'} 
              onClick={save}
              disabled={producerChanges.length === 0}
            />
          </Box>
        ) : null}
      </S.ContainerProducers>

      {!producers.length ? (
        <div style={{ textAlign: 'center' }}>
          Não há produtores cadastrados no momento. Para adicionar um novo
          produtor, clique em 'Novo Produtor'.
        </div>
      ) : null}

      <BackdropLoading loading={loading} />
    </>
  );
}

export default Index;

