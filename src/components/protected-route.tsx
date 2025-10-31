"use client";

import { useAuth } from '../contexts/auth-context';
import { LoginForm } from './login-form';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    return <LoginForm />;
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
          <p className="text-gray-600">Halaman ini hanya untuk Administrator.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}