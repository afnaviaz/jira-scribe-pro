import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ITEMS_PER_PAGE = 5;

const CasosGuardadosScreen = ({ onBack }) => {
  const [casosGuardados, setCasosGuardados] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [expandedSprint, setExpandedSprint] = useState(null);
  const [editData, setEditData] = useState({}); // {storyKey: [casosEditados]}

  // Cargar casos guardados
  useEffect(() => {
    axios.get('http://localhost:5001/api/test-cases')
      .then(res => setCasosGuardados(res.data))
      .catch(err => console.error('Error al cargar casos guardados:', err));
  }, []);

  // Agrupar por sprint
  const casosPorSprint = casosGuardados.reduce((acc, caso) => {
    const sprint = caso.sprintName || 'Sin Sprint';
    if (!acc[sprint]) acc[sprint] = [];
    acc[sprint].push(caso);
    return acc;
  }, {});

  const sprintNames = Object.keys(casosPorSprint);

  // Paginación de historias de usuario (por sprint)
  const paginatedSprintNames = sprintNames.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);

  // Manejar edición de casos
  const handleEditChange = (storyKey, idx, value) => {
    setEditData(prev => ({
      ...prev,
      [storyKey]: {
        ...prev[storyKey],
        [idx]: value
      }
    }));
  };

  // Guardar cambios editados (puedes implementar el guardado en backend aquí)
  const handleSave = (caso) => {
    const nuevosCasos = caso.testCases.map((test, idx) =>
      editData[caso.storyKey] && editData[caso.storyKey][idx] !== undefined
        ? editData[caso.storyKey][idx]
        : test
    );
    // Aquí puedes hacer un POST/PUT para guardar los cambios en el backend
    axios.post('http://localhost:5001/api/test-cases/save', {
      ...caso,
      testCases: nuevosCasos
    }).then(() => {
      alert('Casos de prueba actualizados');
    });
  };

  return (
    <div>
      <h2>Casos de Prueba Guardados</h2>
      {paginatedSprintNames.length === 0 ? (
        <div>No hay casos guardados.</div>
      ) : (
        paginatedSprintNames.map(sprint => (
          <div key={sprint} style={{ marginBottom: 20 }}>
            <div
              style={{
                background: '#f0f0f0',
                padding: 10,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => setExpandedSprint(expandedSprint === sprint ? null : sprint)}
            >
              {sprint}
            </div>
            {expandedSprint === sprint && (
              <div style={{ padding: 10, border: '1px solid #ddd' }}>
                {casosPorSprint[sprint].map(caso => (
                  <div key={caso.storyKey} style={{ marginBottom: 20 }}>
                    <h4>{caso.storyKey} - {caso.storySummary}</h4>
                    {caso.testCases.map((test, idx) => (
                      <textarea
                        key={idx}
                        value={
                          editData[caso.storyKey] && editData[caso.storyKey][idx] !== undefined
                            ? editData[caso.storyKey][idx]
                            : test
                        }
                        onChange={e => handleEditChange(caso.storyKey, idx, e.target.value)}
                        rows={3}
                        style={{ width: '100%', marginBottom: 8 }}
                      />
                    ))}
                    <button onClick={() => handleSave(caso)}>Guardar Cambios</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Paginador */}
      {sprintNames.length > ITEMS_PER_PAGE && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>Anterior</button>
          <span style={{ margin: '0 10px' }}>Página {pagina} de {Math.ceil(sprintNames.length / ITEMS_PER_PAGE)}</span>
          <button onClick={() => setPagina(pagina + 1)} disabled={pagina === Math.ceil(sprintNames.length / ITEMS_PER_PAGE)}>Siguiente</button>
        </div>
      )}

      {/* Botón para volver */}
      <button onClick={onBack} style={{ marginTop: 20 }}>
        Volver
      </button>
    </div>
  );
};

export default CasosGuardadosScreen;