import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { baseUrl } from '../utils/baseUrl';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const navigate = useNavigate();
  const { loginWithPassword, loginWithOtp, verifyOtp } = useAuth();
  const { isDarkMode } = useTheme();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await loginWithPassword(email.trim(), password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await loginWithOtp(email.trim());
      setIsOtpSent(true);
    } catch (error) {
      console.error('OTP request error:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await verifyOtp(otp.trim());
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  const buttonHoverVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      boxShadow: isDarkMode 
        ? '0 10px 25px -5px rgba(79, 70, 229, 0.4)' 
        : '0 10px 25px -5px rgba(79, 70, 229, 0.3)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  const tabVariants = {
    inactive: { 
      backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)',
      color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'
    },
    active: { 
      backgroundColor: 'rgb(79, 70, 229)',
      color: 'rgb(255, 255, 255)',
      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -1px rgba(79, 70, 229, 0.2)'
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-50 via-white to-gray-50'} py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-500 rounded-full filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500 rounded-full filter blur-3xl opacity-5"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className={`${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} rounded-2xl shadow-xl overflow-hidden p-8`}
        >
          <Link to="/" className="block text-center mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-indigo-600'}`}>
              <span className="font-extrabold">Likh</span>
              <span className="text-indigo-500">AI</span>
            </h1>
          </Link>
          
          <h2 className={`text-center text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Sign in to your account
          </h2>

          {/* Login Method Tabs */}
          <div className="flex justify-center space-x-2 mb-8">
            <motion.button
              variants={tabVariants}
              animate={loginMethod === 'password' ? 'active' : 'inactive'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLoginMethod('password')}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Password
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={loginMethod === 'otp' ? 'active' : 'inactive'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLoginMethod('otp')}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              OTP
            </motion.button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-600'} border px-4 py-3 rounded-lg mb-6`}
              >
                <span className="block text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            className="space-y-6"
            onSubmit={
              loginMethod === 'password'
                ? handlePasswordLogin
                : isOtpSent
                ? handleOtpVerification
                : handleOtpRequest
            }
          >
            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className={`appearance-none relative block w-full px-4 py-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 sm:text-sm`}
                  placeholder="Your email address"
                  disabled={isOtpSent}
                />
              </div>

              {loginMethod === 'password' && (
                <div>
                  <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className={`appearance-none relative block w-full px-4 py-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 sm:text-sm`}
                    placeholder="Your password"
                  />
                </div>
              )}
              
              {loginMethod === 'otp' && isOtpSent && (
                <div>
                  <label htmlFor="otp" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    One-Time Password
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setError('');
                    }}
                    className={`appearance-none relative block w-full px-4 py-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 sm:text-sm`}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  to="/signup"
                  className={`font-medium ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'} transition-colors duration-200`}
                >
                  Don't have an account? Sign up
                </Link>
              </div>
            </div>

            <motion.div
              variants={buttonHoverVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <button
                disabled={loading}
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all duration-200 shadow-md"
              >
                {loading ? (
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    <span>Processing...</span>
                  </div>
                ) : loginMethod === 'password' ? (
                  'Sign in'
                ) : isOtpSent ? (
                  'Verify OTP'
                ) : (
                  'Send OTP'
                )}
              </button>
            </motion.div>
          </form>

          {/* Additional help */}
          
        </motion.div>
      </div>
    </div>
  );
};

export default Login;