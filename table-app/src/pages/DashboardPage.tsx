import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashborad';

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleSelectDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  return <Dashboard onSelectDocument={handleSelectDocument} />;
}