import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
