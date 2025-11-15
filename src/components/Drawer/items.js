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
