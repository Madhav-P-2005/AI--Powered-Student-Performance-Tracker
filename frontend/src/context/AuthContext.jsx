import { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Fetch the user profile using the token
          const response = await api.get('/auth/me/');
          setUser(response.data);
        } catch (error) {
          console.error('Init Auth failed:', error);
          // Token might be expired, clear everything
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // 1. Get tokens
      const resp = await api.post('/auth/token/', { username, password });
      
      localStorage.setItem('access_token', resp.data.access);
      localStorage.setItem('refresh_token', resp.data.refresh);

      // 2. Fetch user profile
      const userResp = await api.get('/auth/me/');
      setUser(userResp.data);

      toast.success(`Welcome back, ${userResp.data.username}!`);
      return { success: true, user: userResp.data };
    } catch (error) {
      const msg = error.response?.data?.detail || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register/', userData);
      toast.success('Registration successful. You can now log in.');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data 
        ? Object.values(error.response.data).flat().join(' ') 
        : 'Registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = (showToast = true) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    if (showToast) {
      toast.info('You have been logged out.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
