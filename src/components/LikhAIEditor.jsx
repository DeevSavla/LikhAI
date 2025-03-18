import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { motion } from "framer-motion";
import { SaveIcon, DocumentTextIcon, UserGroupIcon, DownloadIcon, MicrophoneIcon, VolumeUpIcon, StopIcon, ShieldCheckIcon, ExclamationIcon, BeakerIcon } from "@heroicons/react/outline";
import { debounce } from "lodash";
import AIHelperSidebar from "./AIHelperSidebar";

const WS_BASE_URL = 'ws://localhost:5000';
const API_BASE_URL = 'https://likhai.onrender.com';
const PLAGIARISM_API_URL = 'https://api.copyleaks.com/v3/education/scan';

const LikhAIEditor = ({ onSave, onTitleChange, initialTitle = "Untitled Document", initialContent = "", isSaving, documentId, autoSave = false }) => {
  const editorRef = useRef(null);
  const wsRef = useRef(null);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent || '');
  const [loading, setLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const isLocalChange = useRef(false);
  const pendingSave = useRef(null);
  const skipNextUpdate = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const [isPlagiarismChecking, setIsPlagiarismChecking] = useState(false);
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const lastLocalContent = useRef(initialContent || '');
  const [isAIHelperOpen, setIsAIHelperOpen] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      let finalTranscript = '';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (editorRef.current) {
          const editor = editorRef.current;
          const currentContent = editor.getContent();
          
          // Only update with final results
          if (finalTranscript) {
            const newContent = currentContent + ' ' + finalTranscript;
            editor.setContent(newContent);
            setContent(newContent);
            finalTranscript = ''; // Reset final transcript after using it
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speakText = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = editorRef.current ? editorRef.current.getContent({ format: 'text' }) : '';
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Separate content broadcast from save
  const broadcastContent = debounce((newContent) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      isLocalChange.current = true;
      wsRef.current.send(JSON.stringify({
        type: 'content_update',
        content: newContent
      }));
    }
  }, 1000);

  // Separate autosave functionality
  const autoSaveContent = debounce((newContent) => {
    if (pendingSave.current === newContent) return;
    pendingSave.current = newContent;
    
    onSave?.(newContent, false).finally(() => {
      if (pendingSave.current === newContent) {
        pendingSave.current = null;
      }
    });
  }, 2000);

  useEffect(() => {
    // Connect to WebSocket for real-time collaboration
    const token = localStorage.getItem('token');
    if (!token || !documentId) return;

    wsRef.current = new WebSocket(`${WS_BASE_URL}/document/${documentId}?token=${token}`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'content_update' && !isLocalChange.current) {
        if (editorRef.current) {
          const editor = editorRef.current;
          
          // Skip if this is our own change
          if (skipNextUpdate.current) {
            skipNextUpdate.current = false;
            return;
          }

          // Only update if content is actually different
          const currentContent = editor.getContent();
          if (currentContent !== data.content) {
            setContent(data.content);
            editor.setContent(data.content);
          }
        }
      } else if (data.type === 'title_update' && !isLocalChange.current) {
        setTitle(data.title);
        onTitleChange?.(data.title);
      } else if (data.type === 'active_users') {
        setActiveUsers(data.users);
      }
      
      isLocalChange.current = false;
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Try to reconnect after a delay
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          wsRef.current = new WebSocket(`${WS_BASE_URL}/document/${documentId}?token=${token}`);
        }
      }, 3000);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [documentId]);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleEditorChange = (newContent) => {
    // Update local content immediately
    setContent(newContent);
    
    // Handle collaboration and autosave separately
    if (autoSave) {
      skipNextUpdate.current = true; // Skip the next update as it's our own
      broadcastContent(newContent);  // Broadcast changes to other users
      // autoSaveContent(newContent);   // Save to backend without affecting editor
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);

    // Broadcast title change to other users
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'title_update',
        title: newTitle
      }));
    }
  };

  const handleSave = () => {
    // Manual save should be immediate and not debounced
    skipNextUpdate.current = true;
    onSave(content, true);
    
    // Broadcast the save
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'content_update',
        content: content
      }));
    }
  };

  const handleExport = (format) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const content = editor.getContent();
    
    switch (format) {
      case 'pdf':
        editor.execCommand('mcePrintPdf');
        break;
      case 'doc':
        const blob = new Blob([content], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title}.doc`;
        link.click();
        URL.revokeObjectURL(link.href);
        break;
      case 'epub':
        // For EPUB, we'll need to convert HTML to EPUB format
        // This is a basic example - you might want to use a proper EPUB converter library
        const epubBlob = new Blob([content], { type: 'application/epub+zip' });
        const epubLink = document.createElement('a');
        epubLink.href = URL.createObjectURL(epubBlob);
        epubLink.download = `${title}.epub`;
        epubLink.click();
        URL.revokeObjectURL(epubLink.href);
        break;
      default:
        console.error('Unsupported format');
    }
  };

  // Function to split content into scenes
  const splitIntoScenes = (content) => {
    // Split by double line breaks or scene headings (e.g., "Scene 1", "INT.", "EXT.")
    const scenes = content.split(/\n\s*\n|\b(Scene \d+|INT\.|EXT\.)/i)
      .filter(scene => scene && scene.trim())
      .map(scene => scene.trim());
    return scenes;
  };

  // Add new function for text similarity check
  const calculateSimilarity = (text1, text2) => {
    const words1 = text1.toLowerCase().split(/\W+/);
    const words2 = text2.toLowerCase().split(/\W+/);
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return (intersection.size / union.size) * 100;
  };

  // Update the checkPlagiarism function
  const checkPlagiarism = async (sceneContent) => {
    setIsPlagiarismChecking(true);
    try {
      // Split the content into smaller chunks for comparison
      const chunks = sceneContent.split(/[.!?]+/).filter(chunk => chunk.trim().length > 20);
      
      // Simulate plagiarism check by comparing with some sample texts
      // In a real application, you would compare with a database of texts or use an API
      const sampleTexts = [
        "The quick brown fox jumps over the lazy dog.",
        "To be or not to be, that is the question.",
        "It was the best of times, it was the worst of times.",
        // Add more sample texts as needed
      ];

      let maxSimilarity = 0;
      let similarTexts = [];

      for (const chunk of chunks) {
        for (const sampleText of sampleTexts) {
          const similarity = calculateSimilarity(chunk, sampleText);
          if (similarity > 30) { // Threshold for similarity
            maxSimilarity = Math.max(maxSimilarity, similarity);
            similarTexts.push({
              text: sampleText,
              similarity: similarity.toFixed(2)
            });
          }
        }
      }

      // Remove duplicates and sort by similarity
      similarTexts = Array.from(new Set(similarTexts.map(JSON.stringify)))
        .map(JSON.parse)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5); // Keep top 5 matches

      return {
        percentagePlagiarized: maxSimilarity.toFixed(2),
        sources: similarTexts.map(item => ({
          text: item.text,
          similarity: item.similarity
        })),
        text: sceneContent
      };
    } catch (error) {
      console.error('Plagiarism check error:', error);
      return {
        percentagePlagiarized: 0,
        sources: [],
        text: sceneContent,
        error: 'Failed to check plagiarism'
      };
    } finally {
      setIsPlagiarismChecking(false);
    }
  };

  // Function to handle plagiarism check button click
  const handlePlagiarismCheck = async () => {
    if (!editorRef.current) return;

    const content = editorRef.current.getContent({ format: 'text' });
    const scenes = splitIntoScenes(content);
    
    if (scenes.length === 0) {
      alert('No content to check for plagiarism');
      return;
    }

    // Check the first scene or the next unchecked scene
    const sceneToCheck = currentScene === null ? 0 : currentScene + 1;
    if (sceneToCheck >= scenes.length) {
      alert('All scenes have been checked for plagiarism');
      return;
    }

    const result = await checkPlagiarism(scenes[sceneToCheck]);
    setPlagiarismResults(prev => ({
      ...prev,
      [sceneToCheck]: result
    }));
    setCurrentScene(sceneToCheck);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center flex-1">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="text-xl font-semibold bg-transparent border-none focus:outline-none flex-1 mr-4"
            placeholder="Untitled Document"
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* AI Helper Button */}
          <button
            onClick={() => setIsAIHelperOpen(!isAIHelperOpen)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <BeakerIcon className="w-5 h-5 mr-2 text-indigo-600" />
            AI Helper
          </button>

          {/* Existing buttons */}
          <button
            onClick={toggleRecording}
            className={`flex items-center px-3 py-2 text-sm font-medium ${
              isRecording
                ? "text-red-700 bg-red-100 border-red-300"
                : "text-gray-700 bg-white border-gray-300"
            } border rounded-md hover:bg-gray-50`}
          >
            <MicrophoneIcon className="w-5 h-5 mr-2" />
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>

          <button
            onClick={speakText}
            className={`flex items-center px-3 py-2 text-sm font-medium ${
              isSpeaking
                ? "text-yellow-700 bg-yellow-100 border-yellow-300"
                : "text-gray-700 bg-white border-gray-300"
            } border rounded-md hover:bg-gray-50`}
          >
            {isSpeaking ? (
              <StopIcon className="w-5 h-5 mr-2" />
            ) : (
              <VolumeUpIcon className="w-5 h-5 mr-2" />
            )}
            {isSpeaking ? "Stop Speaking" : "Speak Text"}
          </button>

          <button
            onClick={handlePlagiarismCheck}
            className={`flex items-center px-3 py-2 text-sm font-medium ${
              isPlagiarismChecking
                ? "text-blue-700 bg-blue-100 border-blue-300"
                : "text-gray-700 bg-white border-gray-300"
            } border rounded-md hover:bg-gray-50`}
            disabled={isPlagiarismChecking}
          >
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            Check Plagiarism
          </button>

          <button
            onClick={() => handleSave()}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            disabled={isSaving}
          >
            <SaveIcon className="w-5 h-5 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <Editor
          apiKey="7vj7c0b02q2julz14v9fmkczjr35s173ri4p8zz8tz12weom"
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={initialContent}
          value={content}
          onEditorChange={handleEditorChange}
          init={{
            height: "100%",
            menubar: true,
            plugins: [
              "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
              "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
              "insertdatetime", "media", "table", "code", "help", "wordcount"
            ],
            toolbar: "undo redo | blocks | " +
              "bold italic forecolor | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat | help",
            content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; }",
          }}
        />

        {/* Active Users Indicator */}
        {activeUsers.length > 0 && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white p-2 rounded-md shadow-md">
            <UserGroupIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{activeUsers.length} active</span>
          </div>
        )}
      </div>

      {/* AI Helper Sidebar */}
      <AIHelperSidebar
        isOpen={isAIHelperOpen}
        onClose={() => setIsAIHelperOpen(false)}
        documentContent={content}
      />

      {/* Plagiarism Results Modal */}
      {plagiarismResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Plagiarism Check Results</h2>
              <button
                onClick={() => setPlagiarismResults(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {plagiarismResults.map((result, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationIcon className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">
                      {result.similarity}% match with Scene {result.sceneNumber}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{result.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikhAIEditor; 