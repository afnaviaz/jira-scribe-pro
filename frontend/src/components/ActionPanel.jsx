import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// Un componente simple de spinner para el estado de carga
const Spinner = () => <div className="spinner"></div>;

// Icono para el selector de IA
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2h3Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v0A2.5 2.5 0 0 0 14.5 7h3a2.5 2.5 0 0 0 2.5-2.5v0A2.5 2.5 0 0 0 17.5 2h-3Z" />
    <path d="M4.2 7.5a2.5 2.5 0 0 0-2.3 2.2l-.4 2.6a2.5 2.5 0 0 0 2.3 2.8h15.7a2.5 2.5 0 0 0 2.3-2.8l-.4-2.6a2.5 2.5 0 0 0-2.3-2.2H4.2Z" />
    <path d="M6 15a2.5 2.5 0 0 1 2.5 2.5v0A2.5 2.5 0 0 1 6 20H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h2Z" />
    <path d="M18 15a2.5 2.5 0 0 0-2.5 2.5v0A2.5 2.5 0 0 0 18 20h2a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-2Z" />
  </svg>
);

const ActionPanel = () => {
  const {
    selectedStories,
    isLoading,
    aiModel,
    setAiModel,
    handleGenerateContent, // Importamos la función del contexto
  } = useContext(AppContext);

  const storiesSelectedCount = selectedStories.length;
  const isButtonDisabled = storiesSelectedCount === 0 || isLoading;

  return (
    <div className="action-panel-container">
      <div className="action-panel-header">
        <h3>Panel de Acciones</h3>
        <div className="action-panel-setting">
          <BrainIcon />
          <select
            id="ai-model-select"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            disabled={isLoading}
            className="selector-dropdown-small"
          >
            <option value="openai">OpenAI (GPT-4)</option>
            <option value="gemini">Google (Gemini)</option>
          </select>
        </div>
      </div>

      <div className="action-panel-body">
        <div className="action-panel-info">
          {storiesSelectedCount > 0
            ? <>Has seleccionado <strong>{storiesSelectedCount}</strong> historia{storiesSelectedCount > 1 ? 's' : ''}.</>
            : 'Selecciona una o más historias para empezar.'}
        </div>

        <button
          className="generate-button"
          onClick={handleGenerateContent} // Usamos la función del contexto
          disabled={isButtonDisabled}
          title={storiesSelectedCount === 0 ? 'Debes seleccionar al menos una historia' : 'Generar casos de prueba'}
        >
          {isLoading ? (
            <>
              <Spinner />
              Generando...
            </>
          ) : (
            'Generar Casos de Prueba'
          )}
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;