import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, ThemeProvider } from '@mui/material';
import { GlobalContext } from 'contexts/Global';
import { ApplicationUtils } from 'utils/ApplicationUtils';
import Drawer from 'components/Drawer';
import BackdropLoading from 'components/BackdropLoading';


const Admin = (props) => {
  const { company, themeMode, loading } = useContext(GlobalContext);
  const createTheme = (mode) => {
    return ApplicationUtils.createCustomTheme(
      company.custom.colorPrimary, 
      company.custom.colorSecondary,
      mode
    );
  }

  return (
    <ThemeProvider 
      theme={themeMode === 'dark' ? createTheme('dark') : createTheme('light')}
    >
      <Box sx={{ display: 'flex', maxWidth: '1300px', margin: 'auto', width: '100%', overflowX: 'hidden' }}>
        <Drawer />

        <Box component="main" id="app-main" sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2 }, 
          mt: '64px', 
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <Box
            component={props.component}
            onSubmit={props.handleSubmit}
            autoComplete="off"
          >
            <Outlet />
          </Box>
          <Box sx={{ display: 'grid', gap: 1 }}>{props.children}</Box>
        </Box>
      </Box>

      <BackdropLoading loading={loading} />
    </ThemeProvider>
  );
};

export default Admin;
