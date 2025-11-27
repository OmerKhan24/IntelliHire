import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('[AuthProvider] Rendering with user:', user);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.auth.login({ username, password });
      const token = res.data.access_token;
      const refreshToken = res.data.refresh_token;
      const userData = res.data.user;
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      await api.auth.register({ username, email, password, role });
      // Auto-login after registration
      return await login(username, password);
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore logout errors
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isInterviewer = () => user?.role === 'interviewer';
  const isCandidate = () => user?.role === 'candidate';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isInterviewer, isCandidate }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
