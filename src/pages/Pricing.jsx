import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PricingCard = ({ title, price, features, isPopular }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className={`relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${
      isPopular ? 'border-2 border-indigo-500' : 'border border-gray-200 dark:border-gray-700'
    }`}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">${price}</span>
        <span className="text-gray-500 dark:text-gray-400">/month</span>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center text-gray-600 dark:text-gray-300"
          >
            <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </motion.li>
        ))}
      </ul>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full py-3 px-6 rounded-lg font-medium ${
          isPopular
            ? 'bg-indigo-500 text-white hover:bg-indigo-600'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
        } transition-colors duration-200`}
      >
        Get Started
      </motion.button>
    </div>
  </motion.div>
);

const Pricing = () => {
  const pricingPlans = [
    {
      title: 'Basic',
      price: '0',
      features: [
        'Up to 3 projects',
        'Basic AI assistance',
        'Email support',
        'Basic collaboration tools',
        'Standard templates'
      ],
      isPopular: false
    },
    {
      title: 'Pro',
      price: '29',
      features: [
        'Unlimited projects',
        'Advanced AI features',
        'Priority support',
        'Advanced collaboration',
        'Custom templates'
      ],
      isPopular: true
    },
    {
      title: 'Enterprise',
      price: '99',
      features: [
        'Unlimited everything',
        'Custom AI models',
        '24/7 dedicated support',
        'Team management',
        'Custom integration'
      ],
      isPopular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the perfect plan for your writing needs
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;