import React, { useState } from 'react';
import axios from 'axios';
import { XIcon, ChartBarIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/outline';

//const AI_API_BASE_URL = 'https://2fsnqvm4-8000.inc1.devtunnels.ms';
const AI_API_BASE_URL = 'https://hackniche-extra-endpoints.onrender.com';

const AIHelperSidebar = ({ isOpen, onClose, documentContent }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [styleAnalysis, setStyleAnalysis] = useState(null);
  const [generatedScene, setGeneratedScene] = useState(null);

  const analyzeWritingStyle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${AI_API_BASE_URL}/analyze-style`, {
        excerpts: [documentContent]
      });
      setStyleAnalysis(response.data);
    } catch (err) {
      console.error('Style analysis error:', err);
      setError(`Failed to analyze writing style: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateNewScene = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${AI_API_BASE_URL}/generate-scene`);
      setGeneratedScene(response.data.generated_scene);
    } catch (err) {
      console.error('Scene generation error:', err);
      setError(`Failed to generate scene: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-4 border-b dark:border-gray-700 z-10">
        <div className="flex items-center space-x-2">
          <PencilIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Helper</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 text-xl font-bold"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={analyzeWritingStyle}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Analyze Style
              </button>
              <button
                onClick={generateNewScene}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Generate Scene
              </button>
            </div>

            {/* Writing Style Analysis */}
            {styleAnalysis && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Writing Style Analysis
                </h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-600 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Average Sentence Length:</span>{' '}
                      {styleAnalysis.avg_sentence_length.toFixed(2)} words
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Vocabulary Diversity:</span>{' '}
                      {(styleAnalysis.vocabulary_diversity * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-3 rounded">
                    <p className="font-medium text-sm mb-2">Punctuation Frequency:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(styleAnalysis.punctuation_frequency).map(([punct, freq]) => (
                        <div key={punct} className="text-sm">
                          <span className="font-mono">{punct}</span>: {freq}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Total Sentences:</span>{' '}
                      {styleAnalysis.sentence_count}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Scene */}
            {generatedScene && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Generated Scene
                </h3>
                <div className="bg-white dark:bg-gray-600 p-3 rounded">
                  <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                    {generatedScene}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHelperSidebar; 