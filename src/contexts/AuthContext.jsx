import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userEmail = localStorage.getItem('userEmail');
      setUser({ email: userEmail });
    }
    setLoading(false);
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const signup = async (formData) => {
    try {
      if (!validateEmail(formData.email)) {
        throw new Error('Invalid email format');
      }
      const response = await axios.post(`${API_BASE_URL}/signup`, formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', formData.email);
        setUser({ email: formData.email });
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const loginWithPassword = async (email, password) => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      const response = await axios.post(`${API_BASE_URL}/login-with-password`, {
        email,
        password
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', email);
        setUser({ email });
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const loginWithOtp = async (email) => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      const response = await axios.post(`${API_BASE_URL}/login-with-otp`, { email });
      if (response.data.success) {
        localStorage.setItem('tempEmail', email);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const email = localStorage.getItem('tempEmail');
      if (!email) {
        throw new Error('No email found for OTP verification');
      }
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
        email,
        otp
      });
      if (response.data.success) {
        localStorage.removeItem('tempEmail');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', email);
        setUser({ email });
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    signup,
    loginWithPassword,
    loginWithOtp,
    verifyOtp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 