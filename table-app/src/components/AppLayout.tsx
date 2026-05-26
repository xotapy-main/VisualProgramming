import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const currentDocument = useAppSelector((state) => state.documents.currentDocument);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths[0] === 'dashboard') {
      return <span>Мои документы</span>;
    }
    if (paths[0] === 'profile') {
      return (
        <nav style={{ display: 'flex', gap: '8px' }}>
          <Link to="/dashboard" style={{ color: '#007bff', textDecoration: 'none' }}>Мои документы</Link>
          <span>/</span>
          <span>Профиль</span>
        </nav>
      );
    }
    if (paths[0] === 'documents' && paths[1]) {
      return (
        <nav style={{ display: 'flex', gap: '8px' }}>
          <Link to="/dashboard" style={{ color: '#007bff', textDecoration: 'none' }}>Мои документы</Link>
          <span>/</span>
          <span>{currentDocument ? currentDocument.title : 'Загрузка...'}</span>
        </nav>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
          {getBreadcrumbs()}
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/profile" style={{ color: '#333', textDecoration: 'none' }}>
              {user.name} ({user.email})
            </Link>
            <button 
              onClick={() => dispatch(logout())}
              style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Выйти
            </button>
          </div>
        )}
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: '200px', backgroundColor: '#f1f3f5', borderRight: '1px solid #dee2e6', padding: '20px 10px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/dashboard" style={{ display: 'block', padding: '8px', color: '#333', textDecoration: 'none', borderRadius: '4px', backgroundColor: location.pathname === '/dashboard' ? '#e9ecef' : 'transparent' }}>
                Таблица
              </Link>
            </li>
            <li>
              <Link to="/profile" style={{ display: 'block', padding: '8px', color: '#333', textDecoration: 'none', borderRadius: '4px', backgroundColor: location.pathname === '/profile' ? '#e9ecef' : 'transparent' }}>
                Профиль
              </Link>
            </li>
          </ul>
        </aside>

        <main style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}