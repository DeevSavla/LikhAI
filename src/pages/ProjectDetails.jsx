import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserAddIcon, UserGroupIcon } from '@heroicons/react/outline';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_BASE_URL = 'https://likhai.onrender.com';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState('viewer');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    const fetchProjectAndDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch project details
        const projectResponse = await axios.post(`${API_BASE_URL}/fetch-projects`, { token });
        const foundProject = projectResponse.data.projects.find(p => p._id === id);
        if (!foundProject) {
          throw new Error('Project not found');
        }
        setProject(foundProject);

        // Fetch documents for this project
        const documentsResponse = await axios.post(`${API_BASE_URL}/get-user-documents`, { token });
        const projectDocuments = documentsResponse.data.documents.filter(doc => doc.projectId === id);
        setDocuments(projectDocuments);
      } catch (error) {
        console.error('Error fetching project details:', error);
        setError(error.response?.data?.message || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndDocuments();
  }, [id]);

  const handleCreateDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${API_BASE_URL}/create-document`, {
        token,
        title: 'Untitled Document',
        content: '',
        projectId: id
      });

      if (response.data.success) {
        navigate(`/editor/${response.data.document._id}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      setError(error.response?.data?.message || 'Failed to create document');
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${API_BASE_URL}/add-collaborator`, {
        token,
        projectId: id,
        collaboratorEmail,
        role: collaboratorRole
      });

      if (response.data.success) {
        setProject(prev => ({
          ...prev,
          collaborators: response.data.collaborators
        }));
        setCollaboratorEmail('');
        setShowCollaboratorModal(false);
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      setError(error.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (email) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${API_BASE_URL}/remove-collaborator`, {
        token,
        projectId: id,
        collaboratorEmail: email
      });

      if (response.data.success) {
        setProject(prev => ({
          ...prev,
          collaborators: response.data.collaborators
        }));
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      setError(error.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const handleUpdateProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${API_BASE_URL}/update-project`, {
        token,
        projectId: id,
        name: editedTitle
      });

      if (response.data.success) {
        setProject(prev => ({
          ...prev,
          title: editedTitle
        }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError(error.response?.data?.message || 'Failed to update project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project not found
          </h2>
          <Link
            to="/dashboard"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {/* Project Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-3xl font-bold bg-transparent border-b-2 border-indigo-600 focus:outline-none dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateProject}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedTitle(project.title);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {project?.title}
                    </h1>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditedTitle(project.title);
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-gray-500 dark:text-gray-400">
                  Created: {new Date(project?.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCollaboratorModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <UserAddIcon className="h-5 w-5" />
                  <span>Add Collaborator</span>
                </button>
                <button
                  onClick={handleCreateDocument}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  New Document
                </button>
              </div>
            </div>
            {project.description && (
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {project.description}
              </p>
            )}
          </div>

          {/* Collaborators Section */}
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Collaborators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.collaborators.map((collaborator) => (
                  <div
                    key={collaborator.user}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {collaborator.user}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {collaborator.role}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.user)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents List */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Documents
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {documents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No documents yet.</p>
                <button
                  onClick={handleCreateDocument}
                  className="mt-4 text-indigo-600 hover:text-indigo-500"
                >
                  Create your first document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <Link
                    key={doc._id}
                    to={`/editor/${doc._id}`}
                    className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Version {doc.version}</span>
                      <span>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Collaborator Modal */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add Collaborator
            </h3>
            <form onSubmit={handleAddCollaborator}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={collaboratorRole}
                    onChange={(e) => setCollaboratorRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCollaboratorModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails; 