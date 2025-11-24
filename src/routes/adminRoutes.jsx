import { Navigate } from 'react-router-dom';
import Address from 'pages/Address/Index';
import Product from 'pages/Products/Index';
import ProductCreate from 'pages/Products/Create';
import ProductUpdate from 'pages/Products/Update';
import Producers from 'pages/Producers/Index';
import ProducersCreate from 'pages/Producers/Create';
import ProducersUpdate from 'pages/Producers/Update';
import Ordering from 'pages/Ordering/Index';
import Orders from 'pages/Orders/Index';
import Appearance from 'pages/Appearance/Index';
import Home from 'pages/Home';
import PaymentMethod from 'pages/PaymentMethod/Index';
import Payment_Pix from 'pages/PaymentMethod/Payment_Pix';
import Settings from 'pages/Settings/Index';
import Settings_Delivery from 'pages/Settings/Settings_Delivery';
import Settings_OpeningHours from 'pages/Settings/Settings_OpeningHours';
import Settings_Info from 'pages/Settings/Settings_Info';
import Settings_Language from 'pages/Settings/Settings_Language';
import OpeningHours from 'pages/OpeningHours/Index';
import Payment_InDelivery from 'pages/PaymentMethod/Payment_InDelivery';
import Financial from 'pages/Financial/Index';
import Reports from 'pages/Reports/Index';
import Terms from 'pages/Terms';
import Visitors from 'pages/Visitors/Index';
import Coupons from 'pages/Coupons/Index';
import CouponsCreate from 'pages/Coupons/Create';
import CouponsUpdate from 'pages/Coupons/Update';
import AdminLayout from 'layouts/Admin';
import VerifyEmail from 'pages/Auth/VerifyEmail';

const adminRoutes = [
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { path: '', element: <Home /> },
      { path: 'home', element: <Home /> },
      { path: 'verify-email', element: <VerifyEmail /> },

      { path: 'products', element: <Product /> },
      { path: 'products/create', element: <ProductCreate /> },
      { path: 'products/update/:id', element: <ProductUpdate /> },

      { path: 'producers', element: <Producers /> },
      { path: 'producers/create', element: <ProducersCreate /> },
      { path: 'producers/update/:id', element: <ProducersUpdate /> },

      { path: 'ordering', element: <Ordering /> },

      { path: 'orders', element: <Orders /> },

      { path: 'address', element: <Address /> },
      { path: 'appearance', element: <Appearance /> },

      { path: 'financial', element: <Financial /> },

      { path: 'reports', element: <Reports /> },

      { path: 'visitors', element: <Visitors /> },

      { path: 'coupons', element: <Coupons /> },
      { path: 'coupons/create', element: <CouponsCreate /> },
      { path: 'coupons/update/:id', element: <CouponsUpdate /> },

      { path: 'opening-hours', element: <OpeningHours /> },

      {
        path: 'payment-method',
        element: <PaymentMethod />,
        children: [
          { path: 'pay-pix', element: <Payment_Pix /> },
          { path: 'pay-in-delivery', element: <Payment_InDelivery /> },
          
        ],
      },

      {
        path: 'settings',
        element: <Settings />,
        children: [
          { path: 'openinghours', element: <Settings_OpeningHours /> },
          { path: 'delivery', element: <Settings_Delivery /> },
          { path: 'info', element: <Settings_Info /> },
          { path: 'language', element: <Settings_Language /> },
        ],
      },

      { path: '*', element: <Navigate to="/" /> },

      { path: 'terms', element: <Terms /> }
    ],
  },
];

export default adminRoutes;
