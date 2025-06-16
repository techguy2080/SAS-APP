import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import authService from '../services/auth.service';

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: null,
    loading: true,
    error: null
  });

  // Token validity checker
  const isTokenValid = () => {
    const token = auth.token || localStorage.getItem('token');
    if (!token) return false;
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem('token');
      return false;
    }
  };

  // Load user and token from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          authService.setAuthHeader(token);
          const user = await authService.getProfile(token);
          if (user) {
            setAuth({
              user,
              token,
              loading: false,
              error: null
            });
          } else {
            // Invalid token or user not found
            localStorage.removeItem('token');
            setAuth({
              user: null,
              token: null,
              loading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          setAuth({
            user: null,
            token: null,
            loading: false,
            error: 'Authentication failed'
          });
        }
      } else {
        setAuth(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const { token, user } = await authService.login(username, password);
      
      // Set auth header for future requests
      authService.setAuthHeader(token);
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setAuth({
        user,
        token,
        loading: false,
        error: null
      });

      return user;
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Login failed'
      }));
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    authService.setAuthHeader(null);
    setAuth({
      user: null,
      token: null,
      loading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...auth,
        login,
        logout,
        isAuthenticated: !!auth.token && isTokenValid(),
        isTokenValid
      }}
    >
      {!auth.loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;