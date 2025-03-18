import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
    ${isActivePath(path)
      ? isDarkMode
        ? 'text-white bg-gray-700'
        : 'text-gray-900 bg-gray-100'
      : isDarkMode
        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }
  `;

  return (
    <nav className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  LikhAI
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {user && (
              <Link
                to="/dashboard"
                className={navLinkClass('/dashboard')}
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/tutorials"
              className={navLinkClass('/tutorials')}
            >
              <span className="flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-1.5" />
                Tutorials
              </span>
            </Link>

            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                    ${isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{user.email}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`
                      absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 z-50
                      ${isDarkMode
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                      }
                    `}
                  >
                    <button
                      onClick={handleLogout}
                      className={`
                        block w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200
                        ${isDarkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className={navLinkClass('/login')}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium text-white
                    bg-gradient-to-r from-indigo-600 to-indigo-500
                    hover:from-indigo-700 hover:to-indigo-600
                    transition-all duration-200 shadow-md
                  `}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden"
        >
          <div className={`px-4 pt-2 pb-3 space-y-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {user && (
              <Link
                to="/dashboard"
                className={`block ${navLinkClass('/dashboard')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/tutorials"
              className={`block ${navLinkClass('/tutorials')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-1.5" />
                Tutorials
              </span>
            </Link>

            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className={`
                  block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block ${navLinkClass('/login')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`
                    block px-4 py-2 rounded-lg text-sm font-medium text-white
                    bg-gradient-to-r from-indigo-600 to-indigo-500
                    hover:from-indigo-700 hover:to-indigo-600
                    transition-all duration-200 shadow-md
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar; 