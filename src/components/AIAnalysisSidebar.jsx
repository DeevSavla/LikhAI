import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XIcon, ChartBarIcon, UserGroupIcon, EmojiHappyIcon, DocumentTextIcon } from '@heroicons/react/outline';

const AI_API_BASE_URL = 'https://2fsnqvm4-8000.inc1.devtunnels.ms';
// const AI_API_BASE_URL = 'https://hackniche-extra-endpoints.onrender.com';

const AIAnalysisSidebar = ({ isOpen, onClose, documentContent }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [readabilityScore, setReadabilityScore] = useState(null);

  useEffect(() => {
    if (isOpen && documentContent) {
      performAnalysis();
    }
  }, [isOpen, documentContent]);

  const performAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Send initial analysis
      const analysisResponse = await axios.post(`${AI_API_BASE_URL}/analyze`, {
        script_text: documentContent // Changed from script to script_text to match API expectation
      });
      setAnalysisData(analysisResponse.data);

      // Get stats
      const statsResponse = await axios.get(`${AI_API_BASE_URL}/stats`);
      setStats(statsResponse.data.stats);

    //   Get aggregated report
      const reportResponse = await axios.get(`${AI_API_BASE_URL}/report`);
      setReport(reportResponse.data);

      // Get readability score
      const readabilityResponse = await axios.get(`${AI_API_BASE_URL}/readability`);
      setReadabilityScore(readabilityResponse.data.readability_score);
    } catch (err) {
      console.error('Analysis error:', err);
      // Add more detailed error message
      setError(`Failed to analyze document: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-4 border-b dark:border-gray-700 z-10">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis</h2>
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
            {/* Analysis Data */}
            {analysisData && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3">Scene Analysis</h3>
                <div className="space-y-2">
                  <div className="bg-white dark:bg-gray-600 p-3 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {analysisData.analysis?.scene_description}
                    </p>
                  </div>
                  {analysisData.analysis?.sound_effects?.length > 0 && (
                    <div className="bg-white dark:bg-gray-600 p-3 rounded">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Sound Effects</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                        {analysisData.analysis.sound_effects.map((effect, idx) => (
                          <li key={idx}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysisData.analysis?.visual_cues?.length > 0 && (
                    <div className="bg-white dark:bg-gray-600 p-3 rounded">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Visual Cues</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                        {analysisData.analysis.visual_cues.map((cue, idx) => (
                          <li key={idx}>{cue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Character Stats */}
            {stats && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Characters ({stats.character_count || 0})
                </h3>
                <div className="space-y-2">
                  {stats.character_names?.map((name) => (
                    <div key={name} className="bg-white dark:bg-gray-600 p-3 rounded">
                      <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Emotions: {stats.emotions[name] || 'None'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Character Details */}
            {report?.characters && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <EmojiHappyIcon className="h-5 w-5 mr-2" />
                  Character Details
                </h3>
                {Object.entries(report.characters).map(([name, details]) => (
                  <div key={name} className="mb-3 bg-white dark:bg-gray-600 p-3 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Emotions: {details.emotions.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Description: {details.descriptions.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Writer Score */}
            {readabilityScore && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Writer Score
                </h3>
                <div className="bg-white dark:bg-gray-600 p-3 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Readability Score:</span>{' '}
                    {readabilityScore}
                  </p>
                </div>
              </div>
            )}

            {/* Narrative Direction */}
            {report?.narrative_directions?.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3">Narrative Direction</h3>
                <div className="bg-white dark:bg-gray-600 p-3 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {report.narrative_directions.join('\n')}
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

export default AIAnalysisSidebar; 