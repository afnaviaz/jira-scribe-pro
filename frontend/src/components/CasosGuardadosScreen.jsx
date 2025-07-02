import React, { useEffect, useReducer, useMemo } from 'react';
import { getSavedTestCases, saveTestCases as apiSaveTestCases } from '../services/api';

const JIRA_BASE_URL = "https://finkargo.atlassian.net/browse/";

const EyeIcon = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
);

// Define cuántos GRUPOS de sprints se mostrarán por página.
const SPRINTS_PER_PAGE = 3;

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

    return filteredCases.reduce((acc, caso) => {
      const sprintName = caso.sprintName || 'Sin Sprint';
      if (!acc[sprintName]) {
        acc[sprintName] = [];
      }
      acc[sprintName].push(caso);
      return acc;
    }, {});
  }, [allCasos, searchTerm]);

  const sprintNombres = Object.keys(casosAgrupados);
  const totalPaginas = Math.ceil(sprintNombres.length / SPRINTS_PER_PAGE);

  const sprintsPaginadosNombres = sprintNombres.slice(
    (pagina - 1) * SPRINTS_PER_PAGE,
    pagina * SPRINTS_PER_PAGE
  );

  const handleEditChange = (storyKey, idx, value) => {
    dispatch({ type: 'UPDATE_EDIT_DATA', payload: { storyKey, idx, value } });
  };

  const handleStatusChange = (storyKey, idx, status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { storyKey, idx, status } });
  };

  const handleEvidenceChange = (storyKey, idx, evidence) => {
    dispatch({ type: 'UPDATE_EVIDENCE', payload: { storyKey, idx, evidence } });
  };

  const handleSave = async (caso) => {
    const storyKey = caso.storyKey;
    dispatch({ type: 'SAVE_START', payload: storyKey });
    const payload = {
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

  // Simulación de exportar a Jira
  const exportToJira = (caso, idx) => {
    const testCase = editData[caso.storyKey][idx];
    alert(`Exportando a Jira:\nHistoria: ${caso.storyKey}\nEstado: ${testCase.status}\nEvidencia: ${testCase.evidence}\nTexto: ${testCase.text}`);
    // Aquí deberías llamar a tu endpoint real de exportación a Jira
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
      {loading && <div className="spinner-simple" />}
      {error && <div className="feedback-message error">{error}</div>}
      {!loading && !error && (
        <>
          {sprintNombres.length === 0 ? (
            <div className="no-stories-message">{searchTerm ? `No se encontraron casos para "${searchTerm}"` : "No hay casos de prueba guardados."}</div>
          ) : (
            sprintsPaginadosNombres.map(sprintName => {
              const casos = casosAgrupados[sprintName];
              return (
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
                            </div>
                          </div>
                        ))}
                        <div className="saved-case-footer">
                          {saveStatus.storyKey === caso.storyKey && saveStatus.message && (
                            <span className={`save-feedback ${saveStatus.message.includes('Error') ? 'error' : 'success'}`}>{saveStatus.message}</span>
                          )}
                          <button className="save-changes-button" onClick={() => handleSave(caso)} disabled={saveStatus.isSaving}>
                            {saveStatus.isSaving && saveStatus.storyKey === caso.storyKey ? 'Guardando...' : 'Guardar Cambios'}
                          </button>
                        </div>
                      </div>
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