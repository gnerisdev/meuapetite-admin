import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from 'components/Header';
import * as S from './style';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se estiver em /settings sem subrota, redireciona para a primeira opção
    if (location.pathname === '/settings') {
      navigate('delivery', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Obter o título baseado na rota atual
  const getTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles = {
      'delivery': 'Delivery',
      'info': 'Dados'
    };
    return titles[path] || 'Configurações';
  };

  return (
    <S.Container>
      <Header title={getTitle()} back={-1} />
      <Outlet />
    </S.Container>
  );
};

export default Settings;
