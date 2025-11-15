import { useTranslation } from 'react-i18next';

// Hook para obter os itens do menu traduzidos
export const useMenuItems = () => {
  const { t } = useTranslation('admin');
  
  return [
    {
      text: t('menu.dashboard'),
      link: '/home',
      Icon: () => <i className="fas fa-chart-line"></i>,
    },
    {
      text: t('menu.products'),
      link: '/products',
      Icon: () => <i className="fas fa-box"></i>,
    },
    {
      text: t('menu.orders'),
      link: '/orders',
      Icon: () => <i className="fas fa-list"></i>,
    },
    {
      text: t('menu.financial'),
      link: '/financial',
      Icon: () => <i className="fas fa-money-bill-wave"></i>, 
    },
    {
      text: t('menu.visitors'),
      link: '/visitors',
      Icon: () => <i className="fas fa-users"></i>,
    },
    {
      text: t('menu.openingHours'),
      link: '/opening-hours',
      Icon: () => <i className="fas fa-clock"></i>,
    },
    {
      text: t('menu.settings'),
      link: '/settings',
      Icon: () => <i className="fas fa-cog"></i>,  
    },
  ];
};

// Exportar também como array estático para compatibilidade (será traduzido no componente)
export const menuItems = [
  {
    text: 'Dashboard',
    link: '/home',
    Icon: () => <i className="fas fa-chart-line"></i>,
  },
  {
    text: 'Produtos',
    link: '/products',
    Icon: () => <i className="fas fa-box"></i>,
  },
  {
    text: 'Pedidos',
    link: '/orders',
    Icon: () => <i className="fas fa-list"></i>,
  },
  {
    text: 'Financeiro',
    link: '/financial',
    Icon: () => <i className="fas fa-money-bill-wave"></i>, 
  },
  {
    text: 'Visitantes',
    link: '/visitors',
    Icon: () => <i className="fas fa-users"></i>,
  },
  {
    text: 'Horário de Funcionamento',
    link: '/opening-hours',
    Icon: () => <i className="fas fa-clock"></i>,
  },
  {
    text: 'Configurações',
    link: '/settings',
    Icon: () => <i className="fas fa-cog"></i>,  
  },
];
