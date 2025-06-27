import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { exportCasesToJira, saveTestCases } from '../services/api';

const ResultadosDisplay = () => {
  const { generatedContent, isLoading, error, setStoriesWithCases } = useContext(AppContext);
  const [editados, setEditados] = useState({});
  const [exportando, setExportando] = useState(null);
  const [guardando, setGuardando] = useState(null);
  const [guardado, setGuardado] = useState({});
  const [copiado, setCopiado] = useState({});
  const [exportError, setExportError] = useState(null);

  // Muestra un indicador de carga simple si está cargando y aún no hay resultados.
  if (isLoading && (!generatedContent || generatedContent.length === 0)) {
    return (
      <div className="progress-container">
        <div className="progress-label">Generando casos de prueba...</div>
        <div className="spinner-simple" />
      </div>
    );
  }

  // Muestra un mensaje de error si ocurrió uno durante la generación.
  if (error) {
    return <div className="feedback-message error">{error}</div>;
  }

  // Si no está cargando y no hay contenido, muestra el mensaje por defecto.
  if (!isLoading && (!generatedContent || generatedContent.length === 0)) {
    return <div>Resultados Generados: No hay casos de prueba generados.</div>;
  }

  // Si hay contenido, lo renderiza.
  return (
    <div className="results-display-container">
      {generatedContent.map(historia => (
        <div key={historia.storyKey} className="result-story-block">
          <h3 className="result-story-key">{historia.storyKey}</h3>
          <p className="result-story-summary">{historia.storySummary}</p>
          <textarea
            className="result-textarea"
            value={editados[historia.storyKey] ?? (Array.isArray(historia.testCases) ? historia.testCases.join('\n\n') : '')}
            onChange={e => setEditados({ ...editados, [historia.storyKey]: e.target.value })}
          />
          <div className="result-actions">
            <button
              className="export-button"
              disabled={exportando === historia.storyKey || guardando === historia.storyKey}
              onClick={async () => {
                setExportError(null);
                try {
                  setExportando(historia.storyKey);
                  const casesToExport = editados[historia.storyKey] ?? (Array.isArray(historia.testCases) ? historia.testCases.join('\n\n') : '');
                  await exportCasesToJira(historia.storyKey, casesToExport);
                  setStoriesWithCases(prev => [...new Set([...prev, historia.storyKey])]);
                  setCopiado({ ...copiado, [historia.storyKey]: true });
                  setTimeout(() => setCopiado(prev => ({ ...prev, [historia.storyKey]: false })), 2000);
                } catch (error) {
                  console.error("Error exporting to Jira:", error);
                  setExportError({ key: historia.storyKey, message: 'Error al exportar.' });
                } finally {
                  setExportando(null);
                }
              }}
            >
              {exportando === historia.storyKey ? 'Exportando...' : 'Exportar a Jira'}
            </button>
            <button
              className="save-button" // Estilos añadidos más abajo
              disabled={guardando === historia.storyKey || exportando === historia.storyKey}
              onClick={async () => {
                console.log('Save button clicked for story:', historia.storyKey);
                setGuardando(historia.storyKey);
                try {
                  const casesToSave = {
                    storyKey: historia.storyKey,
                    storySummary: historia.storySummary,
                    testCases: editados[historia.storyKey]?.split('\n\n') ?? historia.testCases,
                  };
                  console.log('Data being sent to saveTestCases:', casesToSave);
                  await saveTestCases(casesToSave);
                  console.log('saveTestCases call successful.');
                  setGuardado({ ...guardado, [historia.storyKey]: true });
                  setTimeout(() => setGuardado(prev => ({ ...prev, [historia.storyKey]: false })), 2000);
                } catch (err) {
                  console.error('Error in save button onClick handler:', err);
                  console.error('Error saving test cases:', err);
                  // Opcional: mostrar un mensaje de error al usuario
                } finally {
                  setGuardando(null);
                }
              }}
            >
              {guardando === historia.storyKey ? 'Guardando...' : (guardado[historia.storyKey] ? '¡Guardado!' : 'Guardar')}
            </button>
            {copiado[historia.storyKey] && <span className="feedback-message success">¡Exportado!</span>}
            {exportError && exportError.key === historia.storyKey && <span className="feedback-message error">{exportError.message}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultadosDisplay;