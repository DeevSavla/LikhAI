import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ChatAlt2Icon, ChartBarIcon, ClockIcon, MusicNoteIcon, PauseIcon } from '@heroicons/react/outline';
import Navbar from '../components/Navbar';
import LikhAIEditor from '../components/LikhAIEditor';
import CommentSidebar from '../components/CommentSidebar';
import AIAnalysisSidebar from '../components/AIAnalysisSidebar';
import { baseUrl } from '../utils/baseUrl';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState({
    title: 'Untitled Document',
    content: '',
    description: '',
    currentVersion: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState(location.state?.projectId || null);
  const [isCommentSidebarOpen, setIsCommentSidebarOpen] = useState(false);
  const [isAIAnalysisSidebarOpen, setIsAIAnalysisSidebarOpen] = useState(false);
  const [isVersionSidebarOpen, setIsVersionSidebarOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio('https://play.streamafrica.net/lofiradio'));

  useEffect(() => {
    const fetchDocument = async () => {
      if (id === 'new') {
        if (!location.state?.projectId) {
          navigate('/dashboard');
          return;
        }
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.post(`${baseUrl}/get-document`, {
          token,
          documentId: id
        });

        if (response.data.success) {
          setDocument(response.data.document);
          setProjectId(response.data.document.projectId);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setError(error.response?.data?.message || 'Failed to fetch document');
        if (error.response?.status === 404) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate, location.state]);

  const fetchVersions = async () => {
    if (!id || id === 'new') return;

    try {
      setLoadingVersions(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${baseUrl}/get-document-versions`, {
        token,
        documentId: id
      });

      if (response.data.success) {
        setVersions(response.data.versions);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      setError(error.response?.data?.message || 'Failed to fetch versions');
    } finally {
      setLoadingVersions(false);
    }
  };

  useEffect(() => {
    if (isVersionSidebarOpen) {
      fetchVersions();
    }
  }, [isVersionSidebarOpen, id]);

  const handleSave = async (editorContent, createVersion = false) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (id === 'new') {
        if (!projectId) {
          throw new Error('No project selected');
        }

        const response = await axios.post(`${baseUrl}/create-document`, {
          token,
          title: document.title,
          content: editorContent || '',
          projectId
        });

        if (response.data.success) {
          navigate(`/editor/${response.data.document._id}`);
        }
      } else {
        const response = await axios.post(`${baseUrl}/update-document`, {
          token,
          documentId: id,
          title: document.title,
          content: editorContent,
          createVersion
        });

        if (response.data.success) {
          setDocument(prev => ({
            ...prev,
            content: editorContent,
            currentVersion: response.data.document.currentVersion
          }));
          if (isVersionSidebarOpen && createVersion) {
            fetchVersions();
          }
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError(error.response?.data?.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${baseUrl}/restore-version`, {
        token,
        documentId: id,
        versionNumber
      });

      if (response.data.success) {
        setDocument(response.data.document);
        fetchVersions();
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      setError(error.response?.data?.message || 'Failed to restore version');
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (newTitle) => {
    setDocument(prev => ({
      ...prev,
      title: newTitle
    }));
    document.title = `${newTitle} - LikhAI`;
  };

  const handleProjectSelect = async (selectedProjectId) => {
    setProjectId(selectedProjectId);
    await handleSave(document.content);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="relative">
          <LikhAIEditor
            initialContent={document.content}
            onSave={handleSave}
            onTitleChange={handleTitleChange}
            initialTitle={document.title}
            isSaving={saving}
            documentId={id === 'new' ? null : id}
            autoSave={true}
          />

          {id !== 'new' && (
            <>
              <div className="fixed right-4 top-24 z-50 space-y-4">
              <button
                  onClick={toggleMusic}
                  className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors block relative group"
                  title={isPlaying ? "Pause Music" : "Play LoFi Music"}
                >
                  {isPlaying ? (
                    <PauseIcon className="h-6 w-6" />
                  ) : (
                    <MusicNoteIcon className="h-6 w-6" />
                  )}
                  <span className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {isPlaying ? "Pause Music" : "Play LoFi Music"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setIsCommentSidebarOpen(!isCommentSidebarOpen);
                    setIsAIAnalysisSidebarOpen(false);
                    setIsVersionSidebarOpen(false);
                  }}
                  className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors block relative group"
                  title="Comments"
                >
                  <ChatAlt2Icon className="h-6 w-6" />
                  <span className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Comments
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsAIAnalysisSidebarOpen(!isAIAnalysisSidebarOpen);
                    setIsCommentSidebarOpen(false);
                    setIsVersionSidebarOpen(false);
                  }}
                  className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors block relative group"
                  title="AI Analysis"
                >
                  <ChartBarIcon className="h-6 w-6" />
                  <span className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    AI Analysis
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsVersionSidebarOpen(!isVersionSidebarOpen);
                    setIsCommentSidebarOpen(false);
                    setIsAIAnalysisSidebarOpen(false);
                  }}
                  className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors block relative group"
                  title="Version History"
                >
                  <ClockIcon className="h-6 w-6" />
                  <span className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Version History
                  </span>
                </button>
              </div>

              <CommentSidebar
                isOpen={isCommentSidebarOpen}
                onClose={() => setIsCommentSidebarOpen(false)}
                documentId={id}
              />

              <AIAnalysisSidebar
                isOpen={isAIAnalysisSidebarOpen}
                onClose={() => setIsAIAnalysisSidebarOpen(false)}
                documentContent={document.content}
              />

              {/* Version History Sidebar */}
              {isVersionSidebarOpen && (
                <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
                  <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Version History
                    </h2>
                    <button
                      onClick={() => setIsVersionSidebarOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 text-xl font-bold"
                      aria-label="Close panel"
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-4">
                    {loadingVersions ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                      </div>
                    ) : versions.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center">No versions found</p>
                    ) : (
                      <div className="space-y-4">
                        {versions.map((version) => (
                          <div
                            key={version.versionNumber}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                  Version {version.versionNumber}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(version.createdAt).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  By {version.savedBy.fullname || version.savedBy.email}
                                </p>
                              </div>
                              {version.versionNumber !== document.currentVersion && (
                                <button
                                  onClick={() => handleRestoreVersion(version.versionNumber)}
                                  className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                >
                                  Restore
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor; 