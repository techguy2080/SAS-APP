import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} role
 * @property {string} first_name
 * @property {string} last_name
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {boolean} loading
 * @property {string|null} error
 * @property {boolean} isAuthenticated
 * @property {(username: string, password: string) => Promise<User>} login
 * @property {() => void} logout
 * @property {() => string|null} getToken
 * @property {(error: any) => boolean} handleAuthError
 */

/** @type {React.Context<AuthContextType>} */
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  getToken: () => null,
  handleAuthError: () => false,
  fetchWithAuth: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef(null);

  // --- Place fetchWithAuth here ---
  const fetchWithAuth = async (url, options = {}) => {
    const opts = {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        Authorization: accessTokenRef.current ? `Bearer ${accessTokenRef.current}` : '',
        'Content-Type': options.headers?.['Content-Type'] || 'application/json',
      },
    };

    let response = await fetch(url, opts);

    if (response.status === 401) {
      console.log('Token expired, attempting refresh...');
      // Try to refresh token
      const refreshRes = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const { token } = await refreshRes.json();
        accessTokenRef.current = token;
        localStorage.setItem('token', token); // Store in localStorage too
        opts.headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, opts);
      } else {
        // Clear authentication state
        setUser(null);
        setIsAuthenticated(false);
        accessTokenRef.current = null;
        localStorage.removeItem('token');
        throw new Error('Session expired');
      }
    }

    return response;
  };
  // --- End fetchWithAuth ---

  // Then, implement the initialization effect
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        console.log('Initializing authentication...');
        
        // First check localStorage for a token
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          console.log('Found token in localStorage, using it');
          accessTokenRef.current = storedToken;
          
          try {
            // Validate the token by making a profile request
            const profileRes = await fetchWithAuth('/api/auth/profile');
            if (profileRes.ok) {
              const userData = await profileRes.json();
              setUser(userData);
              setIsAuthenticated(true);
              console.log('Authentication initialized with stored token');
              return; // Exit early on success
            }
          } catch (e) {
            console.error('Stored token validation failed:', e.message);
            // Continue to refresh token attempt
          }
        }
        
        // Try refresh token flow
        const refreshRes = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const { token } = await refreshRes.json();
          console.log('Refresh token success, received access token');
          accessTokenRef.current = token;
          localStorage.setItem('token', token); // Also store in localStorage

          // Use fetchWithAuth for protected call
          const profileRes = await fetchWithAuth('/api/auth/profile');
          if (profileRes.ok) {
            const userData = await profileRes.json();
            setUser(userData);
            setIsAuthenticated(true);
            console.log('Authentication initialized successfully');
          } else {
            console.error('Profile fetch failed:', profileRes.status);
            throw new Error('Failed to fetch profile');
          }
        } else {
          console.error('Refresh token failed:', refreshRes.status);
          throw new Error('Session expired or invalid');
        }
      } catch (error) {
        console.error('Auth initialization error:', error.message);
        // Critical: Reset ALL authentication state on failure
        setUser(null);
        setIsAuthenticated(false);
        accessTokenRef.current = null;
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      // Make sure user.role is stored correctly
      console.log('User logged in with role:', user.role);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return user.role;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Always clean up state regardless of API success
      accessTokenRef.current = null;
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Helper for components to handle auth errors
  const handleAuthError = (error) => {
    if (error?.response?.status === 401 || 
        error?.message === 'Session expired') {
      console.error('Authentication error detected, logging out');
      accessTokenRef.current = null;
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      return true; // Auth error handled
    }
    return false; // Not an auth error
  };

  // Helper to check token validity (JWT expiration)
  const isTokenValid = () => {
    const token = accessTokenRef.current || localStorage.getItem('token');
    if (!token) return false;
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        // Token expired
        accessTokenRef.current = null;
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch {
      accessTokenRef.current = null;
      localStorage.removeItem('token');
      return false;
    }
  };

  // Return provider with extended functionality
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading,
        error, 
        login, 
        logout,
        fetchWithAuth,
        getToken: () => accessTokenRef.current || localStorage.getItem('token'),
        handleAuthError,
        isTokenValid // <-- Expose this helper
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};