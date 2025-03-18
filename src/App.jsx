import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { AuthProvider } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import Tutorials from './pages/Tutorials';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10 pointer-events-none" />
                
                {/* Animated Gradient Orbs */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
                
                {/* Main Content */}
                <div className="relative z-10">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/tutorials" element={<Tutorials />} />
                    <Route
                      path="/editor/new"
                      element={
                        <ProtectedRoute>
                          <Editor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/editor/:id"
                      element={
                        <ProtectedRoute>
                          <Editor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/project/:id"
                      element={
                        <ProtectedRoute>
                          <ProjectDetails />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </div>
              </motion.div>
            </AnimatePresence>
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;