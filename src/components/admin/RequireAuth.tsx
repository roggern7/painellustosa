import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { hasToken, validateToken, getToken, clearToken } from '@/lib/cfApi';
import { Loader2 } from 'lucide-react';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    if (!hasToken()) {
      setStatus('denied');
      return;
    }

    validateToken(getToken()).then((valid) => {
      if (valid) {
        setStatus('ok');
      } else {
        clearToken();
        setStatus('denied');
      }
    });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
