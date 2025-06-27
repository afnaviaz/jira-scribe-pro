import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// Un componente simple de spinner para el estado de carga
const Spinner = () => <div className="spinner"></div>;

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
      <h3 className="action-panel-header">Panel de Acciones</h3>
      
      <div className="action-panel-setting">
        <label htmlFor="ai-model-select">Motor de IA:</label>
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

      <div className="action-panel-info">
        {storiesSelectedCount > 0
          ? `Tienes ${storiesSelectedCount} historia${storiesSelectedCount > 1 ? 's' : ''} seleccionada${storiesSelectedCount > 1 ? 's' : ''}.`
          : 'Por favor, selecciona una o más historias de la lista.'}
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
  );
};

export default ActionPanel;