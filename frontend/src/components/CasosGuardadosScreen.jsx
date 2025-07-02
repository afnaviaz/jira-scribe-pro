import React, { useEffect, useReducer, useMemo, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getSavedTestCases, saveTestCases as apiSaveTestCases } from '../services/api';

const JIRA_BASE_URL = "https://finkargo.atlassian.net/browse/";

const EyeIcon = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
);

const BugIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
    <path d="M5.5 7.5A.5.5 0 0 1 5 7h-1a.5.5 0 0 1-.5.5v1A.5.5 0 0 1 4 9h1a.5.5 0 0 1 .5-.5zM8 5.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 5.5m3.34 5.345a.5.5 0 0 1 .707.707l-1.293 1.293a.5.5 0 0 1-.707 0l-1.293-1.293a.5.5 0 1 1 .707-.707L11 11.086zM4.95 11.752a.5.5 0 0 1 .707-.707L7 12.465l1.343-1.414a.5.5 0 1 1 .707.707L7.707 13.172a.5.5 0 0 1-.707 0zM13 2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

// Define cuántos GRUPOS de sprints se mostrarán por página.
const PROJECTS_PER_PAGE = 2; // Ahora paginamos por proyecto

// --- INICIO: Lógica del Reducer para gestionar el estado complejo ---
const initialState = {
  allCasos: [],
  loading: true,
  error: null,
  pagina: 1,
  editData: {},
  searchTerm: '',
  saveStatus: { storyKey: null, isSaving: false, message: '' },
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        allCasos: action.payload.allCasos,
        editData: action.payload.editData,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload, pagina: 1 }; // Resetea la página al buscar
    case 'SET_PAGE':
      return { ...state, pagina: action.payload };
    case 'UPDATE_EDIT_DATA': {
      const { storyKey, idx, value } = action.payload;
      return {
        ...state,
        editData: {
          ...state.editData,
          [storyKey]: state.editData[storyKey].map((test, i) =>
            i === idx ? { ...test, text: value } : test
          ),
        },
      };
    }
    case 'UPDATE_STATUS': {
      const { storyKey, idx, status } = action.payload;
      return {
        ...state,
        editData: {
          ...state.editData,
          [storyKey]: state.editData[storyKey].map((test, i) =>
            i === idx ? { ...test, status, evidence: status !== 'NOK' ? '' : test.evidence } : test
          ),
        },
      };
    }
    case 'UPDATE_EVIDENCE': {
      const { storyKey, idx, evidence } = action.payload;
      return {
        ...state,
        editData: {
          ...state.editData,
          [storyKey]: state.editData[storyKey].map((test, i) =>
            i === idx ? { ...test, evidence } : test
          ),
        },
      };
    }
    case 'DELETE_TEST_CASE': {
      const { storyKey, idx } = action.payload;
      return {
        ...state,
        editData: {
          ...state.editData,
          [storyKey]: state.editData[storyKey].filter((_, i) =>
            i !== idx
          ),
        },
      };
    }
    case 'DELETE_ALL_TEST_CASES': {
      const { storyKey } = action.payload;
      return {
        ...state,
        editData: {
          ...state.editData,
          [storyKey]: [], // Simplemente vacía el array de casos de prueba para esta historia
        },
      };
    }
    case 'SAVE_START':
      return { ...state, saveStatus: { storyKey: action.payload, isSaving: true, message: '' } };
    case 'SAVE_SUCCESS':
      return { ...state, saveStatus: { storyKey: action.payload, isSaving: false, message: '¡Guardado!' } };
    case 'SAVE_ERROR':
      return { ...state, saveStatus: { storyKey: action.payload, isSaving: false, message: 'Error al guardar' } };
    case 'RESET_SAVE_STATUS':
      return { ...state, saveStatus: { storyKey: null, isSaving: false, message: '' } };
    default:
      throw new Error(`Acción no manejada: ${action.type}`);
  }
}
// --- FIN: Lógica del Reducer ---

const CasosGuardadosScreen = () => {
  const { projects } = useContext(AppContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { allCasos, loading, error, pagina, editData, searchTerm, saveStatus } = state;

  useEffect(() => {
    const fetchCases = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const data = await getSavedTestCases();
        const standardizedData = data.map(caso => ({
          ...caso,
          sprintName: caso.sprintName || 'Sin Sprint',
          projectName: caso.projectName || 'Sin Proyecto',
          testCases: (caso.testCases || []).map(tc =>
            typeof tc === 'string' ? { text: tc, status: 'Pendiente', evidence: '' } : tc
          )
        }));
        const initialEditData = standardizedData.reduce((acc, caso) => {
          acc[caso.storyKey] = caso.testCases;
          return acc;
        }, {});
        dispatch({ type: 'FETCH_SUCCESS', payload: { allCasos: standardizedData, editData: initialEditData } });
      } catch (err) {
        console.error('Error al cargar casos guardados:', err);
        dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar casos guardados.' });
      }
    };
    fetchCases();
  }, []);

  // Filtra y agrupa los casos usando useMemo para optimizar el rendimiento.
  const casosAgrupados = useMemo(() => {
    const filteredCases = allCasos.filter(caso =>
      caso.storyKey.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Agrupa primero por proyecto, luego por sprint
    return filteredCases.reduce((acc, caso) => {
      const projectName = caso.projectName || 'Sin Proyecto';
      const sprintName = caso.sprintName || 'Sin Sprint';

      if (!acc[projectName]) {
        acc[projectName] = {};
      }
      if (!acc[projectName][sprintName]) {
        acc[projectName][sprintName] = [];
      }
      acc[projectName][sprintName].push(caso);
      return acc;
    }, {});
  }, [allCasos, searchTerm]);

  const projectNombres = Object.keys(casosAgrupados);
  const totalPaginas = Math.ceil(projectNombres.length / PROJECTS_PER_PAGE);

  const proyectosPaginadosNombres = projectNombres.slice(
    (pagina - 1) * PROJECTS_PER_PAGE,
    pagina * PROJECTS_PER_PAGE
  );

  const executionSummary = useMemo(() => {
    const summary = { OK: 0, NOK: 0, Pendiente: 0, Total: 0 };
    // Se calcula el resumen a partir de `editData` para que refleje los cambios en tiempo real (como eliminaciones).
    if (!editData) return summary;

    Object.values(editData).forEach(testCases => {
      (testCases || []).forEach(tc => {
        summary[tc.status]++;
        summary.Total++;
      });
    });

    return summary;
  }, [editData]);

  const handleEditChange = (storyKey, idx, value) => {
    dispatch({ type: 'UPDATE_EDIT_DATA', payload: { storyKey, idx, value } });
  };

  const handleStatusChange = (storyKey, idx, status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { storyKey, idx, status } });
  };

  const handleEvidenceChange = (storyKey, idx, evidence) => {
    dispatch({ type: 'UPDATE_EVIDENCE', payload: { storyKey, idx, evidence } });
  };

  const handleDeleteTestCase = (storyKey, idx) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este caso de prueba? El cambio se guardará permanentemente al hacer clic en "Guardar Cambios".')) {
      dispatch({ type: 'DELETE_TEST_CASE', payload: { storyKey, idx } });
    }
  };

  const handleDeleteAllTestCases = (storyKey) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar TODOS los casos de prueba para la historia ${storyKey}? El cambio se guardará permanentemente al hacer clic en "Guardar Cambios".`)) {
      dispatch({ type: 'DELETE_ALL_TEST_CASES', payload: { storyKey } });
    }
  };

  const handleSave = async (caso) => {
    const storyKey = caso.storyKey;
    dispatch({ type: 'SAVE_START', payload: storyKey });
    const payload = {
      projectKey: caso.projectKey,
      projectName: caso.projectName,
      sprintName: caso.sprintName,
      storyKey: storyKey,
      storySummary: caso.storySummary,
      testCases: editData[storyKey]
    };
    try {
      await apiSaveTestCases(payload);
      dispatch({ type: 'SAVE_SUCCESS', payload: storyKey });
      setTimeout(() => dispatch({ type: 'RESET_SAVE_STATUS' }), 2000);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      dispatch({ type: 'SAVE_ERROR', payload: storyKey });
      setTimeout(() => dispatch({ type: 'RESET_SAVE_STATUS' }), 3000);
    }
  };

  const handleCreateBug = (caso, testCase) => {
    const summary = `BUG: ${caso.storyKey} - Falla en escenario de prueba`;
    const description = `Se encontró un error al ejecutar el siguiente caso de prueba para la historia ${caso.storyKey}:\n\n{code}\n${testCase.text}\n{code}\n\n*Pasos para reproducir:*\n1. \n2. \n3. \n\n*Resultado esperado:*\n\n\n*Resultado actual:*\n\n`;
    const jiraUrl = `${JIRA_BASE_URL.split('/browse/')[0]}/secure/CreateIssueDetails!init.jspa?pid=${caso.projectKey.split('-')[0]}&issuetype=10004&summary=${encodeURIComponent(summary)}&description=${encodeURIComponent(description)}`;
    window.open(jiraUrl, '_blank');
  };

  const exportToJira = (caso, idx) => {
    const testCase = editData[caso.storyKey][idx];
    alert(`Exportando a Jira:\nHistoria: ${caso.storyKey}\nEstado: ${testCase.status}\nEvidencia: ${testCase.evidence}\nTexto: ${testCase.text}`);
  };

  return (
    <div className="saved-cases-container">
      <div className="saved-cases-header-controls">
        <h2>Casos de Prueba Guardados</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por clave de historia..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
          />
        </div>
      </div>
      <div className="execution-summary-panel">
          <div className="summary-card total">
              <span className="summary-value">{executionSummary.Total}</span>
              <span className="summary-label">Total Casos</span>
          </div>
          <div className="summary-card ok">
              <span className="summary-value">{executionSummary.OK}</span>
              <span className="summary-label">OK</span>
          </div>
          <div className="summary-card nok">
              <span className="summary-value">{executionSummary.NOK}</span>
              <span className="summary-label">NOK</span>
          </div>
          <div className="summary-card pending">
              <span className="summary-value">{executionSummary.Pendiente}</span>
              <span className="summary-label">Pendiente</span>
          </div>
      </div>
      {loading && <div className="spinner-simple" />}
      {error && <div className="feedback-message error">{error}</div>}
      {!loading && !error && (
        <>
          {projectNombres.length === 0 ? (
            <div className="no-stories-message">{searchTerm ? `No se encontraron casos para "${searchTerm}"` : "No hay casos de prueba guardados."}</div>
          ) : (
            proyectosPaginadosNombres.map(projectName => {
              const sprints = casosAgrupados[projectName];
              return (
                <div key={projectName} className="project-group">
                  <h2 className="project-group-title">{projectName}</h2>
                  {Object.entries(sprints).map(([sprintName, casos]) => (
                    <div key={sprintName} className="sprint-group">
                      <h3 className="sprint-group-title">{sprintName}</h3>
                      {casos.map(caso => (
                        <div key={caso.storyKey} className="saved-case-card">
                          <div className="saved-case-header">
                            <h4 className="saved-case-title">{caso.storyKey} - {caso.storySummary}</h4>
                            <a href={`${JIRA_BASE_URL}${caso.storyKey}`} target="_blank" rel="noopener noreferrer" title="Ver en Jira" className="jira-link">
                              <EyeIcon />
                            </a>
                          </div>
                          <div className="saved-case-body">
                            {(editData[caso.storyKey] || []).map((test, idx) => (
                              <div key={idx} className="edit-case-row">
                                <textarea className="edit-case-textarea" value={test.text} onChange={e => handleEditChange(caso.storyKey, idx, e.target.value)} rows={6} />
                                <div className="edit-case-controls">
                                  <select className="edit-case-select" value={test.status} onChange={e => handleStatusChange(caso.storyKey, idx, e.target.value)}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="OK">OK</option>
                                    <option value="NOK">NOK</option>
                                  </select>
                                  {test.status === 'NOK' && (
                                    <input type="text" className="edit-case-input" placeholder="Enlace de evidencia" value={test.evidence} onChange={e => handleEvidenceChange(caso.storyKey, idx, e.target.value)} />
                                  )}
                                  <button className="export-case-button" onClick={() => exportToJira(caso, idx)}>Exportar a Jira</button>
                                  {test.status === 'NOK' && (
                                    <button className="create-bug-button" onClick={() => handleCreateBug(caso, test)}>
                                      <BugIcon /> Crear Bug
                                    </button>
                                  )}
                                  <button className="delete-case-button" title="Eliminar caso de prueba" onClick={() => handleDeleteTestCase(caso.storyKey, idx)}>
                                    <TrashIcon />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="saved-case-footer">
                              {saveStatus.storyKey === caso.storyKey && saveStatus.message && (
                                <span className={`save-feedback ${saveStatus.message.includes('Error') ? 'error' : 'success'}`}>{saveStatus.message}</span>
                              )}
                              <div className="footer-buttons">
                                <button
                                  className="delete-all-button"
                                  onClick={() => handleDeleteAllTestCases(caso.storyKey)}
                                  disabled={saveStatus.isSaving && saveStatus.storyKey === caso.storyKey}
                                  title="Eliminar todos los casos para esta historia"
                                >
                                  Eliminar Todos
                                </button>
                                <button className="save-changes-button" onClick={() => handleSave(caso)} disabled={saveStatus.isSaving && saveStatus.storyKey === caso.storyKey}>
                                  {saveStatus.isSaving && saveStatus.storyKey === caso.storyKey ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })
          )}

          {totalPaginas > 1 && (
            <div className="pagination-controls">
              <button className="pagination-button" onClick={() => dispatch({ type: 'SET_PAGE', payload: pagina - 1 })} disabled={pagina === 1}>Anterior</button>
              <span className="pagination-info">Página {pagina} de {totalPaginas}</span>
              <button className="pagination-button" onClick={() => dispatch({ type: 'SET_PAGE', payload: pagina + 1 })} disabled={pagina === totalPaginas}>Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CasosGuardadosScreen;