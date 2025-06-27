import React, { useEffect, useState, Fragment } from 'react';
import { getSavedTestCases, saveTestCases as apiSaveTestCases } from '../services/api';

const JIRA_BASE_URL = "https://finkargo.atlassian.net/browse/";

const EyeIcon = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
);

const ITEMS_PER_PAGE = 5;

const CasosGuardadosScreen = () => {
  const [casosGuardados, setCasosGuardados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [editData, setEditData] = useState({}); // { storyKey: testCases[] }
  const [saveStatus, setSaveStatus] = useState({ storyKey: null, isSaving: false, message: '' });

  const fetchCases = () => {
    setLoading(true);
    getSavedTestCases()
      .then(data => {
        // `getSavedTestCases` devuelve el array de datos directamente.
        const standardizedData = data.map(caso => ({
          ...caso,
          sprintName: caso.sprintName || 'Sin Sprint',
          testCases: (caso.testCases || []).map(tc => // Añadimos un fallback `[]` por si testCases no existe.
            typeof tc === 'string' ? { text: tc, status: 'Pendiente', evidence: '' } : tc
          )
        }));
        setCasosGuardados(standardizedData);

        const initialEditData = standardizedData.reduce((acc, caso) => {
          acc[caso.storyKey] = caso.testCases;
          return acc;
        }, {});
        setEditData(initialEditData);
      })
      .catch(err => {
        console.error('Error al cargar casos guardados:', err);
        setError('Error al cargar casos guardados.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const historiasPaginadas = casosGuardados.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);

  const handleEditChange = (storyKey, idx, value) => {
    setEditData(prev => ({
      ...prev,
      [storyKey]: prev[storyKey].map((test, i) => i === idx ? { ...test, text: value } : test)
    }));
  };

  const handleStatusChange = (storyKey, idx, status) => {
    setEditData(prev => ({
      ...prev,
      [storyKey]: prev[storyKey].map((test, i) => i === idx ? { ...test, status, evidence: status !== 'NOK' ? '' : test.evidence } : test)
    }));
  };

  const handleEvidenceChange = (storyKey, idx, evidence) => {
    setEditData(prev => ({
      ...prev,
      [storyKey]: prev[storyKey].map((test, i) => i === idx ? { ...test, evidence } : test)
    }));
  };

  const handleSave = async (caso) => {
    const storyKey = caso.storyKey;
    setSaveStatus({ storyKey, isSaving: true, message: '' });
    const payload = {
      sprintName: caso.sprintName,
      storyKey: storyKey,
      storySummary: caso.storySummary,
      testCases: editData[storyKey]
    };
    try {
      await apiSaveTestCases(payload);
      setSaveStatus({ storyKey, isSaving: false, message: '¡Guardado!' });
      setTimeout(() => setSaveStatus({ storyKey: null, isSaving: false, message: '' }), 2000);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      setSaveStatus({ storyKey, isSaving: false, message: 'Error al guardar' });
      setTimeout(() => setSaveStatus({ storyKey: null, isSaving: false, message: '' }), 3000);
    }
  };

  // Simulación de exportar a Jira
  const exportToJira = (caso, idx) => {
    const testCase = editData[caso.storyKey][idx];
    alert(`Exportando a Jira:\nHistoria: ${caso.storyKey}\nEstado: ${testCase.status}\nEvidencia: ${testCase.evidence}\nTexto: ${testCase.text}`);
    // Aquí deberías llamar a tu endpoint real de exportación a Jira
  };

  return (
    <div className="saved-cases-container">
      <h2>Casos de Prueba Guardados</h2>
      {loading && <div className="spinner-simple" />}
      {error && <div className="feedback-message error">{error}</div>}
      {!loading && !error && (
        <Fragment>
          {historiasPaginadas.length === 0 ? (
            <div className="no-stories-message">No hay casos de prueba guardados.</div>
          ) : (
            historiasPaginadas.map(caso => (
              <div key={caso.storyKey} className="saved-case-card">
                <div className="saved-case-header">
                  <span className="sprint-name">Sprint: {caso.sprintName}</span>
                  <a href={`${JIRA_BASE_URL}${caso.storyKey}`} target="_blank" rel="noopener noreferrer" title="Ver en Jira" className="jira-link">
                    <EyeIcon />
                  </a>
                </div>
                <div className="saved-case-body">
                  <h4>{caso.storyKey} - {caso.storySummary}</h4>
                  {(editData[caso.storyKey] || []).map((test, idx) => (
                      <div key={idx} className="edit-case-row">
                        <textarea
                          className="edit-case-textarea"
                          value={test.text}
                          onChange={e => handleEditChange(caso.storyKey, idx, e.target.value)}
                          rows={6}
                        />
                        <div className="edit-case-controls">
                          <select
                            className="edit-case-select"
                            value={test.status}
                            onChange={e => handleStatusChange(caso.storyKey, idx, e.target.value)}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="OK">OK</option>
                            <option value="NOK">NOK</option>
                          </select>
                          {test.status === 'NOK' && (
                            <input
                              type="text"
                              className="edit-case-input"
                              placeholder="Enlace de evidencia"
                              value={test.evidence}
                              onChange={e => handleEvidenceChange(caso.storyKey, idx, e.target.value)}
                            />
                          )}
                          <button className="export-case-button" onClick={() => exportToJira(caso, idx)}>Exportar a Jira</button>
                        </div>
                      </div>
                    ))}
                  <div className="saved-case-footer">
                    {saveStatus.storyKey === caso.storyKey && saveStatus.message && (
                      <span className={`save-feedback ${saveStatus.message.includes('Error') ? 'error' : 'success'}`}>
                        {saveStatus.message}
                      </span>
                    )}
                    <button className="save-changes-button" onClick={() => handleSave(caso)} disabled={saveStatus.isSaving}>
                      {saveStatus.isSaving && saveStatus.storyKey === caso.storyKey ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {casosGuardados.length > ITEMS_PER_PAGE && (
            <div className="pagination-controls">
              <button className="pagination-button" onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>Anterior</button>
              <span className="pagination-info">Página {pagina} de {Math.ceil(casosGuardados.length / ITEMS_PER_PAGE)}</span>
              <button className="pagination-button" onClick={() => setPagina(pagina + 1)} disabled={pagina === Math.ceil(casosGuardados.length / ITEMS_PER_PAGE)}>Siguiente</button>
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default CasosGuardadosScreen;