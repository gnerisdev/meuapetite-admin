import { Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Terms from 'pages/Terms';

const authRoutes = [
  {
    path: '/',
    children: [
      { path: 'login', element: <Login /> },
      { path: '', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'terms', element: <Terms /> }
    ],
  },
  { path: '*', element: <Navigate to="/login" /> },
];

export default authRoutes; 