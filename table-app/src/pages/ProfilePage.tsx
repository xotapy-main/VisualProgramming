import React from 'react';
import { useAppSelector } from '../store/hooks';

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <div>Пользователь не авторизован</div>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2>Профиль пользователя</h2>
      <div style={{ marginBottom: '10px' }}>
        <strong>Имя:</strong> {user.name}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Email:</strong> {user.email}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>ID:</strong> {user.id}
      </div>
    </div>
  );
}