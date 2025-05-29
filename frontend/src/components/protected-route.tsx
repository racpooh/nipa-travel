'use client';

import { useAuth } from '@/libs/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from './loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (requireAdmin && !isAdmin) {
        router.push('/dashboard'); // Redirect non-admin users to dashboard
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requireAdmin && !isAdmin) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
}