import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api', // <-- ¡Asegúrate de que sea el puerto del backend!
});

// Funciones para llamar a la API usando axios

export async function getProjects() {
  const response = await apiClient.get('/jira/projects');
  return response.data;
}

export const getSprints = (projectKey) => apiClient.get(`/jira/sprints/${projectKey}`);
export const getStories = (sprintId) => apiClient.get(`/jira/stories/${sprintId}`);
export async function generateContent(stories, model) {
  // El nombre del modelo ('openai' o 'gemini') determina el endpoint
  const endpoint = `/${model}/generate`;
  const response = await apiClient.post(endpoint, { stories, type: model });
  return response.data; // El backend devuelve el array de resultados directamente.
}

export async function exportCasesToJira(storyKey, casesText) {
  return apiClient.post('/jira/add-comment', { storyKey, comment: casesText });
}

export async function saveTestCases(testCaseData) {
  // testCaseData debe ser un objeto como { storyKey, storySummary, testCases }
  return apiClient.post('/test-cases/save', testCaseData);
}

export async function getSavedTestCases() {
  const response = await apiClient.get('/test-cases');
  return response.data;
}

export function loadStories(sprintId, setStories, setError) {
  if (!sprintId) {
    setError('Debes seleccionar un sprint.');
    return;
  }
  getStories(sprintId)
    .then(res => setStories(res.data))
    .catch(err => {
      console.error(err);
      setError('Error al cargar historias');
    });
}

export default {
  getProjects,
  getSprints,
  getStories,
  generateContent,
  exportCasesToJira,
  saveTestCases,
  getSavedTestCases,
  loadStories,
};
