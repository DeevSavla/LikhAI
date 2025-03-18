import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, BookOpenIcon, AcademicCapIcon } from '@heroicons/react/outline';
import Navbar from '../components/Navbar';
import { useTheme } from '../contexts/ThemeContext';

// Pre-loaded tutorials data
const TUTORIALS = [
    {
        id: 1,
        type: 'video',
        title: 'The Art of Creative Writing',
        description: 'Learn the fundamentals of creative writing and storytelling techniques.',
        thumbnail: 'https://i.ibb.co/VvC0vpN/creative-writing.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=YZxaJ1LUqjQ',
        category: 'Creative Writing'
    },
    {
        id: 2,
        type: 'article',
        title: 'How to Write Compelling Characters',
        description: 'Master the art of creating memorable and relatable characters in your stories.',
        url: 'https://blog.reedsy.com/guide/character-development/',
        image: 'https://i.ibb.co/M6ZYWSK/characters.jpg',
        category: 'Character Development'
    },
    {
        id: 3,
        type: 'video',
        title: 'Writing Better Dialogue',
        description: 'Tips and techniques for crafting natural and engaging dialogue.',
        thumbnail: 'https://i.ibb.co/Xy6Y2Yy/dialogue.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=DkwcHNDjvYo',
        category: 'Dialogue'
    },
    {
        id: 4,
        type: 'article',
        title: 'World Building Essentials',
        description: 'Create immersive and believable worlds for your stories.',
        url: 'https://blog.reedsy.com/guide/worldbuilding/',
        image: 'https://i.ibb.co/VxFyKZF/worldbuilding.jpg',
        category: 'World Building'
    },
    {
        id: 5,
        type: 'video',
        title: 'Writing Effective Story Endings',
        description: 'Learn how to craft satisfying and memorable endings.',
        thumbnail: 'https://i.ibb.co/0MZ6Pxg/story-endings.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=0F-ok6AGYtc',
        category: 'Story Structure'
    },
    {
        id: 6,
        type: 'video',
        title: 'Mastering Story Structure',
        description: 'Understanding the key elements of story structure and plot development.',
        thumbnail: 'https://i.ibb.co/xGV2Lz4/story-structure.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=urJDb3E5P1U',
        category: 'Story Structure'
    },
    {
        id: 7,
        type: 'article',
        title: 'Writing Effective Description',
        description: 'Learn how to paint vivid pictures with words and engage your readers.',
        url: 'https://blog.reedsy.com/show-dont-tell/',
        image: 'https://i.ibb.co/VpNJgZR/description.jpg',
        category: 'Description'
    },
    {
        id: 8,
        type: 'video',
        title: 'Creating Conflict in Your Story',
        description: 'Learn how to create and maintain tension in your writing.',
        thumbnail: 'https://i.ibb.co/wSRtRJZ/conflict.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=RNCuR8QQh_4',
        category: 'Plot Development'
    },
    {
        id: 9,
        type: 'article',
        title: 'Writing Authentic Emotions',
        description: 'Tips for conveying genuine emotions in your characters.',
        url: 'https://blog.reedsy.com/guide/character-development/character-emotions/',
        image: 'https://i.ibb.co/0jX1Lqy/emotions.jpg',
        category: 'Character Development'
    },
    {
        id: 10,
        type: 'video',
        title: 'World-Building Techniques',
        description: 'Advanced strategies for creating rich and believable fictional worlds.',
        thumbnail: 'https://i.ibb.co/FXyXPz6/world-building.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=2XpbcDvxVXA',
        category: 'World Building'
    },
    {
        id: 11,
        type: 'article',
        title: 'Writing Effective Action Scenes',
        description: 'Learn how to write dynamic and engaging action sequences.',
        url: 'https://blog.reedsy.com/guide/action-scenes/',
        image: 'https://i.ibb.co/qyCxYz0/action-scenes.jpg',
        category: 'Scene Writing'
    },
    {
        id: 12,
        type: 'video',
        title: 'Character Arc Development',
        description: 'Understanding how to create meaningful character growth.',
        thumbnail: 'https://i.ibb.co/Kj0Y8Yb/character-arc.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=w1JbkGFVsaA',
        category: 'Character Development'
    },
    {
        id: 13,
        type: 'article',
        title: 'Writing Romance Subplots',
        description: 'Tips for weaving romantic elements into your story.',
        url: 'https://blog.reedsy.com/guide/romance-writing/',
        image: 'https://i.ibb.co/VTyPgzF/romance.jpg',
        category: 'Genre Writing'
    },
    {
        id: 14,
        type: 'video',
        title: 'Pacing Your Story',
        description: 'Learn how to control the rhythm and flow of your narrative.',
        thumbnail: 'https://i.ibb.co/xf6WSHM/pacing.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=1OHk1R8z-_Y',
        category: 'Story Structure'
    },
    {
        id: 15,
        type: 'article',
        title: 'Writing Effective Dialogue Tags',
        description: 'Master the art of dialogue attribution and beats.',
        url: 'https://blog.reedsy.com/guide/dialogue/',
        image: 'https://i.ibb.co/Lp9tY4Y/dialogue-tags.jpg',
        category: 'Dialogue'
    }
];

const Tutorials = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTutorial, setSelectedTutorial] = useState(null);
    const { isDarkMode } = useTheme();

    const categories = ['all', ...new Set(TUTORIALS.map(tutorial => tutorial.category))];

    const filteredTutorials = TUTORIALS.filter(tutorial => {
        const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    const cardHoverVariants = {
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

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-50 via-white to-gray-50'} transition-colors duration-300`}>
            <Navbar />
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-500 rounded-full filter blur-3xl opacity-5"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500 rounded-full filter blur-3xl opacity-5"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div 
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-12"
                >
                    <h1 className={`text-4xl sm:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Writing Tutorials
                    </h1>
                    <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Enhance your writing skills with our curated collection of tutorials
                    </p>
                </motion.div>

                {/* Search and Filter */}
                <motion.div 
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    className="mb-12 space-y-6"
                >
                    <div className="relative w-full max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search tutorials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                                isDarkMode 
                                    ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                                    : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
                        />
                        <SearchIcon className={`h-6 w-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} absolute left-4 top-1/2 transform -translate-y-1/2`} />
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map(category => (
                            <motion.button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                                        : isDarkMode
                                            ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                                            : 'bg-white/90 text-gray-700 hover:bg-gray-100/90'
                                }`}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Tutorials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTutorials.map(tutorial => (
                        <motion.div
                            key={tutorial.id}
                            variants={cardHoverVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            className={`rounded-xl shadow-lg overflow-hidden cursor-pointer ${
                                isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'
                            }`}
                            onClick={() => setSelectedTutorial(tutorial)}
                        >
                            <div className="relative pb-[56.25%]">
                                <img
                                    src={tutorial.type === 'video' ? tutorial.thumbnail : tutorial.image}
                                    alt={tutorial.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-medium rounded-full shadow-md">
                                    {tutorial.type === 'video' ? 'Video' : 'Article'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {tutorial.title}
                                </h3>
                                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {tutorial.description}
                                </p>
                                <div className={`flex items-center text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    <BookOpenIcon className="h-4 w-4 mr-1" />
                                    {tutorial.category}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tutorial Modal */}
                <AnimatePresence>
                    {selectedTutorial && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${
                                    isDarkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'
                                }`}
                            >
                                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                                    <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedTutorial.title}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedTutorial(null)}
                                        className={`text-2xl font-medium ${
                                            isDarkMode 
                                                ? 'text-gray-400 hover:text-gray-200' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        } transition-colors`}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="p-6">
                                    {selectedTutorial.type === 'video' ? (
                                        <div className="space-y-6">
                                            <img
                                                src={selectedTutorial.thumbnail}
                                                alt={selectedTutorial.title}
                                                className="w-full rounded-xl shadow-lg"
                                            />
                                            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {selectedTutorial.description}
                                            </p>
                                            <motion.a
                                                href={selectedTutorial.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg shadow-md hover:from-red-700 hover:to-red-600 transition-all duration-200"
                                            >
                                                Watch on YouTube
                                            </motion.a>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <img
                                                src={selectedTutorial.image}
                                                alt={selectedTutorial.title}
                                                className="w-full rounded-xl shadow-lg"
                                            />
                                            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {selectedTutorial.description}
                                            </p>
                                            <motion.a
                                                href={selectedTutorial.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200"
                                            >
                                                Read Full Article
                                            </motion.a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Tutorials; 