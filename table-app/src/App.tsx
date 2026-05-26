import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { store } from './store/store';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import SpreadsheetPage from './pages/SpreadsheetPage';
import ProfilePage from './pages/ProfilePage';

const protectedLoader = () => {
  const state = store.getState();
  const isAuthenticated = state.auth.isAuthenticated;

  if (!isAuthenticated) {
    return Navigate({ to: '/login', replace: true });
  }
  
  return null;
};

const publicLoader = () => {
  const state = store.getState();
  if (state.auth.isAuthenticated) {
    return Navigate({ to: '/dashboard', replace: true });
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    loader: protectedLoader, 
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'documents/:documentId',
        element: <SpreadsheetPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '/login',
    loader: publicLoader,
    element: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <h2>Пожалуйста, войдите в систему</h2>
        <p>Страница авторизации (замени на свой LoginPage)</p>
      </div>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;