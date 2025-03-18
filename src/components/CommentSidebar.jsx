import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ChatAlt2Icon } from '@heroicons/react/outline';
import axios from 'axios';

const API_BASE_URL = 'https://likhai.onrender.com';

const CommentSidebar = ({ isOpen, onClose, documentId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchComments();
    }
  }, [isOpen, documentId]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.post(`${API_BASE_URL}/get-comments`, {
        token,
        documentId
      });

      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error.response?.data?.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.post(`${API_BASE_URL}/add-comment`, {
        token,
        documentId,
        text: newComment.trim()
      });

      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.response?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-50"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-4 border-b dark:border-gray-700 z-10">
              <div className="flex items-center space-x-2">
                <ChatAlt2Icon className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 text-xl font-bold"
                aria-label="Close panel"
              >
                ×
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : comments.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-center">
                  No comments yet
                </div>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {comment.user.email}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="p-4 border-t dark:border-gray-700">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="3"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Comment
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentSidebar; 