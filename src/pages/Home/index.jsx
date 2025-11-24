import { useContext, useState } from 'react';
import { Box, Collapse } from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import VerifyEmail from 'pages/Auth/VerifyEmail';
import InstallPWAButton from 'components/InstallPWAButton';
import Header from 'components/Header';
import Dashboard from './components/Dashboard';
import OperationalPanel from './components/OperationalPanel';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { company } = useContext(GlobalContext);
  const { t } = useTranslation('admin');
  const [showDashboard, setShowDashboard] = useState(false);

  // Redirecionar para verificação de email se não estiver verificado
  if (!company.verifyEmail) {
    return <VerifyEmail />;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Botão de Instalação PWA */}
      <InstallPWAButton />
      
      {/* Header padrão */}
      <Header title={t('dashboard.title')} />
      
      {/* Painel Operacional - aparece apenas quando a loja estiver online E o dashboard não estiver sendo exibido */}
      {company.online && !showDashboard && (
        <OperationalPanel 
          showDashboard={showDashboard}
          onToggleDashboard={() => setShowDashboard(!showDashboard)}
        />
      )}

      {/* Dashboard com métricas e gráficos - aparece quando a loja está offline OU quando showDashboard é true */}
      <Collapse in={!company.online || showDashboard} collapsedSize={0}>
        <Dashboard 
          showOperationalPanel={company.online && !showDashboard}
          onGoToOperationalPanel={() => setShowDashboard(false)}
        />
      </Collapse>
    </Box>
  );
};

export default Home;
