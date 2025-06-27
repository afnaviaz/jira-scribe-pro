import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ITEMS_PER_PAGE = 5;

const CasosGuardadosScreen = ({ onBack }) => {
  const [casosGuardados, setCasosGuardados] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [editData, setEditData] = useState({}); // {storyKey: { idx: { text, status, evidence } }}

  useEffect(() => {
    axios.get('http://localhost:5001/api/test-cases')
      .then(res => setCasosGuardados(res.data))
      .catch(err => console.error('Error al cargar casos guardados:', err));
  }, []);

  const todasLasHistorias = casosGuardados.map(caso => ({
    ...caso,
    sprint: caso.sprintName || 'Sin Sprint'
  }));

  const historiasPaginadas = todasLasHistorias.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);

  const handleEditChange = (storyKey, idx, value) => {
    setEditData(prev => ({
      ...prev,
      [storyKey]: {
        ...prev[storyKey],
        [idx]: {
          ...prev[storyKey]?.[idx],
          text: value
        }
      }
    }));
  };

  const handleStatusChange = (storyKey, idx, status) => {
    setEditData(prev => ({
      ...prev,
      [storyKey]: {
        ...prev[storyKey],
        [idx]: {
          ...prev[storyKey]?.[idx],
          status,
          evidence: status === 'NOK' ? prev[storyKey]?.[idx]?.evidence ?? '' : ''
        }
      }
    }));
  };

  const handleEvidenceChange = (storyKey, idx, evidence) => {
    setEditData(prev => ({
      ...prev,
      [storyKey]: {
        ...prev[storyKey],
        [idx]: {
          ...prev[storyKey]?.[idx],
          evidence
        }
      }
    }));
  };

  const handleSave = (caso) => {
    const nuevosCasos = caso.testCases.map((test, idx) => ({
      text: editData[caso.storyKey]?.[idx]?.text ?? (typeof test === 'string' ? test : test.text),
      status: editData[caso.storyKey]?.[idx]?.status ?? (typeof test === 'object' ? test.status : 'Pendiente'),
      evidence: editData[caso.storyKey]?.[idx]?.evidence ?? (typeof test === 'object' ? test.evidence : '')
    }));
    axios.post('http://localhost:5001/api/test-cases/save', {
      ...caso,
      testCases: nuevosCasos
    }).then(() => {
      alert('Casos de prueba actualizados');
      axios.get('http://localhost:5001/api/test-cases')
        .then(res => setCasosGuardados(res.data));
    });
  };

  // Simulación de exportar a Jira
  const exportToJira = (caso, idx) => {
    const testCase = editData[caso.storyKey]?.[idx] ?? (typeof caso.testCases[idx] === 'object' ? caso.testCases[idx] : { text: caso.testCases[idx], status: 'Pendiente', evidence: '' });
    alert(`Exportando a Jira:\nHistoria: ${caso.storyKey}\nEstado: ${testCase.status}\nEvidencia: ${testCase.evidence}\nTexto: ${testCase.text}`);
    // Aquí deberías llamar a tu endpoint real de exportación a Jira
  };

  return (
    <div>
      <h2>Casos de Prueba Guardados</h2>
      {historiasPaginadas.length === 0 ? (
        <div>No hay casos guardados.</div>
      ) : (
        historiasPaginadas.map(caso => (
          <div key={caso.storyKey} style={{ marginBottom: 20, border: '1px solid #ccc', padding: 10 }}>
            <div style={{ fontWeight: 'bold', background: '#f0f0f0', padding: 8 }}>
              {caso.sprint}
            </div>
            <h4>{caso.storyKey} - {caso.storySummary}</h4>
            {caso.testCases.map((test, idx) => {
              const testObj = typeof test === 'object' ? test : { text: test, status: 'Pendiente', evidence: '' };
              const editObj = editData[caso.storyKey]?.[idx] ?? {};
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                  <textarea
                    value={editObj.text ?? testObj.text}
                    onChange={e => handleEditChange(caso.storyKey, idx, e.target.value)}
                    rows={8}
                    style={{ width: '60%', marginRight: 8 }}
                  />
                  <select
                    value={editObj.status ?? testObj.status}
                    onChange={e => handleStatusChange(caso.storyKey, idx, e.target.value)}
                    style={{ marginRight: 8 }}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="OK">OK</option>
                    <option value="NOK">NOK</option>
                  </select>
                  {(editObj.status ?? testObj.status) === 'NOK' && (
                    <input
                      type="text"
                      placeholder="Enlace de evidencia"
                      value={editObj.evidence ?? testObj.evidence}
                      onChange={e => handleEvidenceChange(caso.storyKey, idx, e.target.value)}
                      style={{ marginRight: 8, width: 180 }}
                    />
                  )}
                  <button onClick={() => exportToJira(caso, idx)}>Exportar a Jira</button>
                </div>
              );
            })}
            <button onClick={() => handleSave(caso)}>Guardar Cambios</button>
          </div>
        ))
      )}

      {/* Paginador */}
      {todasLasHistorias.length > ITEMS_PER_PAGE && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>Anterior</button>
          <span style={{ margin: '0 10px' }}>Página {pagina} de {Math.ceil(todasLasHistorias.length / ITEMS_PER_PAGE)}</span>
          <button onClick={() => setPagina(pagina + 1)} disabled={pagina === Math.ceil(todasLasHistorias.length / ITEMS_PER_PAGE)}>Siguiente</button>
        </div>
      )}

      <button onClick={onBack} style={{ marginTop: 20 }}>
        Volver
      </button>
    </div>
  );
};

export default CasosGuardadosScreen;