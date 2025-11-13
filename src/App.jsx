import { useRoutes } from 'react-router-dom';
import { GlobalContext, GlobalProvider } from 'contexts/Global';
import authRoutes from 'routes/authRoutes';
import adminRoutes from 'routes/adminRoutes';
import { useContext } from 'react';
import BackdropLoading from 'components/BackdropLoading';
import Store from 'pages/Store';

const GlobalStyles = () => (
  <style>
    {`
      input:-webkit-autofill, input:-webkit-autofill:hover, 
      input:-webkit-autofill:focus, input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #02020200 inset !important;
        background-color: inherit !important;
        color: inherit !important;
      }
    `}
  </style>
);

const Routes = () => {
  const globalContext = useContext(GlobalContext);
  const { authenticationStatus } = globalContext;

  // Rotas públicas (sempre acessíveis)
  const publicRoutes = [
    { path: '/store/:slug', element: <Store /> }
  ];

  const AuthRoutes = () => {
    const routes = useRoutes([...authRoutes, ...publicRoutes]);
    return <>{routes}</>;
  };

  const AdminRoutes = () => {
    const routes = useRoutes([...adminRoutes, ...publicRoutes]);
    return <>{routes}</>;
  };

  return (
    <>
      {authenticationStatus === 'authenticating' 
        && <BackdropLoading loading="Carregando" bgColor="#282a37" />
      }
      {authenticationStatus === 'authenticated' && <AdminRoutes />}
      {authenticationStatus === 'unauthenticated' && <AuthRoutes />}
    </>
  );
};

const App = () => {
  return (
    <GlobalProvider>
      <GlobalStyles />
      <Routes />
    </GlobalProvider>
  );
};

export default App;
