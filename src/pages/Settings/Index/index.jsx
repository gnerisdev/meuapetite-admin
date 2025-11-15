import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from 'components/Header';
import * as S from './style';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('admin');

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
      'delivery': t('settings.delivery'),
      'info': t('settings.info'),
      'language': t('settings.language')
    };
    return titles[path] || t('settings.title');
  };

  return (
    <S.Container>
      <Header title={getTitle()} back={-1} />
      <Outlet />
    </S.Container>
  );
};

export default Settings;
