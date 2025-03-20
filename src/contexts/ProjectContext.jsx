import React, { createContext, useState, useContext } from 'react';
import { baseUrl } from '../utils/baseUrl';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [comments, setComments] = useState([]);

  const addProject = (project) => {
    setProjects([...projects, { ...project, id: Date.now(), createdAt: new Date() }]);
  };

  const updateProject = (id, updates) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const addCollaborator = (collaborator) => {
    setCollaborators([...collaborators, collaborator]);
  };

  const addComment = (comment) => {
    setComments([...comments, { ...comment, id: Date.now(), timestamp: new Date() }]);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      collaborators,
      comments,
      setCurrentProject,
      addProject,
      updateProject,
      deleteProject,
      addCollaborator,
      addComment
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}; 