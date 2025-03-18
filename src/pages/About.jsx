import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TeamMember = ({ name, role, image }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="text-center"
  >
    <div className="relative w-32 h-32 mx-auto mb-4">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover rounded-full"
      />
      <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-0 hover:opacity-10 transition-opacity duration-200" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
    <p className="text-gray-600 dark:text-gray-400">{role}</p>
  </motion.div>
);

const About = () => {
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About LikhAI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Revolutionizing content creation with AI-powered collaboration
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300">
            At LikhAI, we're on a mission to transform the way people write and collaborate. 
            By combining cutting-edge AI technology with intuitive design, we're making it easier 
            than ever for teams to create exceptional content together. Our platform is built 
            with a focus on innovation, security, and user experience.
          </p>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Innovation</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Pushing the boundaries of what's possible with AI-assisted writing.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Building tools that bring teams together and enhance creativity.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Security</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ensuring your content is protected with enterprise-grade security.
            </p>
          </div>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
};

export default About;