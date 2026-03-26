import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'HEIR' ? '/heir-dashboard' : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;
