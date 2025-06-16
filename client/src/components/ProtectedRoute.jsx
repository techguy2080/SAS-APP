import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  // For debugging, log current path and user role
  console.log('Route access attempt:', {
    path: location.pathname,
    userRole: user?.role,
    allowedRoles
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // This is the critical check - verify user role is in allowed roles
  if (!allowedRoles.includes(user.role)) {
    console.error(`Access denied: User with role ${user.role} attempted to access ${location.pathname}`);
    
    // Redirect to the user's appropriate dashboard based on their role
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;