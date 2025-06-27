import React, { createContext, useState } from 'react';
import { generateContent as generateContentApi } from '../services/api';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedStories, setSelectedStories] = useState([]);
  const [generatedContent, setGeneratedContent] = useState([]); // Cambiado a array vacío
  const [isLoading, setIsLoading] = useState(false);
  const [aiModel, setAiModel] = useState('openai'); // Nuevo estado para el modelo de IA
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSprints, setSelectedSprints] = useState([]);
  const [storiesWithCases, setStoriesWithCases] = useState([]);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const handleGenerateContent = async () => {
    if (selectedStories.length === 0) return;
    setGeneratedContent([]); // Limpia resultados anteriores para una nueva generación
    setIsResultsModalOpen(true); // Abre el modal inmediatamente para mostrar el progreso
    setIsLoading(true);
    setError(null);
    try {
      const generatedData = await generateContentApi(selectedStories, aiModel);
      setGeneratedContent(generatedData.result); // Asignamos directamente el array
      setStoriesWithCases(prevCases => {
        const newCases = selectedStories.map(s => s.key);
        return [...new Set([...prevCases, ...newCases])];
      });
      setSelectedStories([]); // Limpia la selección para la siguiente operación
    } catch (err) {
      setError('Error al generar los casos de prueba. Revisa la consola para más detalles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    projects, setProjects,
    sprints, setSprints,
    stories, setStories,
    selectedStories, setSelectedStories,
    generatedContent, setGeneratedContent,
    isLoading, setIsLoading,
    aiModel, setAiModel, // Añadido al contexto
    error, setError,
    selectedProject, setSelectedProject,
    selectedSprints, setSelectedSprints,
    storiesWithCases, setStoriesWithCases,
    handleGenerateContent,
    isResultsModalOpen,
    setIsResultsModalOpen,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}