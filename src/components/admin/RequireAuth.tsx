import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { hasToken } from '@/lib/cfApi';

export default function RequireAuth({ children }: { children: ReactNode }) {
  if (!hasToken()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
