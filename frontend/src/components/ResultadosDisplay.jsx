import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { exportCasesToJira, saveTestCases } from '../services/api';

const ResultadosDisplay = () => {
  const { generatedContent, isLoading, error, setStoriesWithCases, sprints, selectedSprints } = useContext(AppContext);
  // Estado para el texto editado en cada textarea
  const [editados, setEditados] = useState({});
  // Estado unificado para manejar el estado de las acciones (guardar, exportar)
  const [actionStatus, setActionStatus] = useState({
    storyKey: null, // Clave de la historia en la que se realiza la acción
    type: null,     // 'saving', 'exporting', 'success', 'error'
    message: '',    // Mensaje para el usuario
  });

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

  const handleSave = async (historia) => {
    const storyKey = historia.storyKey;
    setActionStatus({ storyKey, type: 'saving', message: 'Guardando...' });

    try {
      // Si el texto fue editado, lo usamos; si no, usamos el original.
      const rawTestCases = editados[storyKey]
        ? editados[storyKey].split('\n\n').filter(Boolean)
        : historia.testCases;

      // Estandarizamos el formato para asegurar que siempre sea un array de objetos.
      const testCasesToSave = rawTestCases.map(tc => ({
        text: tc,
        status: 'Pendiente',
        evidence: '',
      }));

      const sprintId = selectedSprints.length > 0 ? selectedSprints[0] : null;
      const sprint = sprintId ? sprints.find(s => String(s.id) === sprintId) : null;
      const sprintName = sprint ? sprint.name : 'General';

      const payload = {
        storyKey: storyKey,
        storySummary: historia.storySummary,
        sprintName,
        testCases: testCasesToSave,
      };

      await saveTestCases(payload);
      setActionStatus({ storyKey, type: 'success', message: '¡Guardado!' });
      setTimeout(() => setActionStatus({ storyKey: null, type: null, message: '' }), 2000);
    } catch (err) {
      console.error('Error saving test cases:', err);
      setActionStatus({ storyKey, type: 'error', message: 'Error al guardar' });
    }
  };

  const handleExport = async (historia) => {
    const storyKey = historia.storyKey;
    setActionStatus({ storyKey, type: 'exporting', message: 'Exportando...' });
    try {
      const casesToExport = editados[storyKey] ?? (Array.isArray(historia.testCases) ? historia.testCases.join('\n\n') : '');
      await exportCasesToJira(storyKey, casesToExport);
      setStoriesWithCases(prev => [...new Set([...prev, storyKey])]);
      setActionStatus({ storyKey, type: 'success', message: '¡Exportado!' });
      setTimeout(() => setActionStatus({ storyKey: null, type: null, message: '' }), 2000);
    } catch (error) {
      console.error("Error exporting to Jira:", error);
      setActionStatus({ storyKey, type: 'error', message: 'Error al exportar' });
    }
  };

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
            {/* Botón de Exportar */}
            <button
              className="export-button"
              disabled={actionStatus.type === 'saving' || actionStatus.type === 'exporting'}
              onClick={() => handleExport(historia)}
            >
              {actionStatus.type === 'exporting' && actionStatus.storyKey === historia.storyKey ? 'Exportando...' : 'Exportar a Jira'}
            </button>
            {/* Botón de Guardar */}
            <button
              className="save-button"
              disabled={actionStatus.type === 'saving' || actionStatus.type === 'exporting'}
              onClick={() => handleSave(historia)}
            >
              {actionStatus.type === 'saving' && actionStatus.storyKey === historia.storyKey ? 'Guardando...' : 'Guardar'}
            </button>
            {/* Mensaje de feedback */}
            {actionStatus.storyKey === historia.storyKey && actionStatus.message && (
              <span className={`feedback-message ${actionStatus.type === 'error' ? 'error' : 'success'}`}>
                {actionStatus.message}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultadosDisplay;