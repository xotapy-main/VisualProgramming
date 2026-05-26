<<<<<<< HEAD
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import SpreadsheetPage from './pages/SpreadsheetPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NonFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents/:documentId" element={<SpreadsheetPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
=======
import React, { useState } from 'react';
import Dashboard from './components/dashborad';
import Spreadsheet from './components/table';

function App() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  if (activeDocumentId) {
    return (
      <Spreadsheet 
        documentId={activeDocumentId} 
        onBackToDashboard={() => setActiveDocumentId(null)} 
      />
    );
  }

  return <Dashboard onSelectDocument={(id) => setActiveDocumentId(id)} />;
}
>>>>>>> parent of c7e336e (Проведен рефакторинг проекта на Redux реализованы slices и тесты для них)

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}