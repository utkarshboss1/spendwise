import React, { createContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage
  useEffect(() => {
    const checkUserAuth = () => {
      try {
        const currentUser = authApi.getCurrentUser();
        const token = localStorage.getItem('token');
        if (currentUser && token) {
          setUser(currentUser);
        } else {
          // If state is half-configured, clean it up
          authApi.logout();
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to initialize user authentication:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authApi.register(name, email, password);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
