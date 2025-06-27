import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

// URL base para los enlaces a Jira
const JIRA_BASE_URL = "https://finkargo.atlassian.net/browse/";

// Componente de ícono de ojo para previsualizar en Jira
const EyeIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <path
      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
      stroke="#222"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="#222"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StoryList = () => {
  // Obtiene historias y selección desde el contexto global
  const { stories, selectedStories, setSelectedStories, storiesWithCases } = useContext(AppContext);

  // Estado local para la página actual
  const [page, setPage] = useState(1);

  // Número de historias por página
  const storiesPerPage = 15;

  // Calcula el total de páginas
  const totalPages = Math.ceil(stories.length / storiesPerPage);

  // Obtiene las historias a mostrar en la página actual
  const paginatedStories = stories.slice((page - 1) * storiesPerPage, page * storiesPerPage);

  // Maneja la selección/deselección de una historia
  const handleSelectStory = (story) => {
    // Si la historia ya tiene casos generados, no permitir deseleccionar ni seleccionar
    if (storiesWithCases.includes(story.key)) {
      return;
    }
    if (selectedStories.some(s => s.id === story.id)) {
      // Si ya está seleccionada, la quita
      setSelectedStories(selectedStories.filter(s => s.id !== story.id));
    } else {
      // Si no está seleccionada, la agrega
      setSelectedStories([...selectedStories, story]);
    }
  };


  return (
    <div className="story-list-container">
      <h3></h3>
      <table className="story-table">
        <thead>
          <tr>
            <th className="story-table-header" style={{ width: 40 }}></th>
            <th className="story-table-header" style={{ width: 100 }}>Clave</th>
            <th className="story-table-header" style={{ width: 'auto' }}>Resumen</th>
            <th className="story-table-header" style={{ width: 60 }}>Ver</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStories.map(story => (
            <tr key={story.id}>
              <td style={{ textAlign: 'center' }}>
                {/* Checkbox para seleccionar/deseleccionar historia */}
                <input
                  type="checkbox"
                  disabled={storiesWithCases.includes(story.key)} // Deshabilita si ya tiene casos generados
                  checked={selectedStories.some(s => s.id === story.id)}
                  onChange={() => handleSelectStory(story)}
                  id={`story-${story.id}`}
                />
              </td>
              {/* Clave de la historia */}
              <td className="story-key-cell">
                {story.key}
                {storiesWithCases.includes(story.key) && (
                  <span className="story-tag">FK</span>
                )}
              </td>
              {/* Resumen de la historia */}
              <td className="story-summary-cell">
                {story.fields.summary}
              </td>
              <td className="story-action-cell">
                {/* Enlace para abrir la historia en Jira */}
                <a
                  href={`${JIRA_BASE_URL}${story.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver en Jira"
                  style={{ display: 'inline-block', verticalAlign: 'middle' }}
                >
                  <EyeIcon />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Controles de paginación */}
      <div className="pagination-controls">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default StoryList;