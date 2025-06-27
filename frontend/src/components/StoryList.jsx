import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

// URL base para los enlaces a Jira
const JIRA_BASE_URL = "https://finkargo.atlassian.net/browse/";
// Componente de ícono de ojo para previsualizar en Jira
const EyeIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
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
      <h3 className="story-list-title">Historias de Usuario</h3>
      <div className="story-table-wrapper">
        <table className="story-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}></th>
              <th style={{ width: '15%' }}>Clave</th>
              <th style={{ width: '70%' }}>Resumen</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Jira</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStories.map(story => {
              const isSelected = selectedStories.some(s => s.id === story.id);
              const isDisabled = storiesWithCases.includes(story.key);
              return (
                <tr
                  key={story.id}
                  className={`story-row ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => handleSelectStory(story)}
                >
                  <td>
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        disabled={isDisabled}
                        checked={isSelected}
                        readOnly
                      />
                      <span className="checkmark"></span>
                    </div>
                  </td>
                  <td className="story-key-cell">
                    <span>{story.key}</span>
                    {/* Eliminamos la etiqueta "Generado" */}
                  </td>
                  <td className="story-summary-cell">
                    {story.fields.summary}
                  </td>
                  <td className="story-action-cell">
                    <a
                      href={`${JIRA_BASE_URL}${story.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver en Jira"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EyeIcon />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Controles de paginación */}
      <div className="pagination-controls">
        <button className="pagination-button" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Anterior
        </button>
        <span className="pagination-info">
          Página {page} de {totalPages}
        </span>
        <button className="pagination-button" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default StoryList;