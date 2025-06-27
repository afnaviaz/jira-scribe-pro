import React, { useState } from 'react';

const SprintTable = ({ sprints, onSelectSprint, selectedSprints = [] }) => {
  const [page, setPage] = useState(1);
  const sprintsPerPage = 10;
  const totalPages = Math.ceil(sprints.length / sprintsPerPage);
  const paginatedSprints = sprints.slice((page - 1) * sprintsPerPage, page * sprintsPerPage);

  if (!sprints || sprints.length === 0) {
    return <div style={{ textAlign: 'center' }}>No hay sprints para mostrar.</div>;
  }

  const handleCheck = (sprintId) => {
    if (selectedSprints.includes(sprintId)) {
      onSelectSprint(selectedSprints.filter(id => id !== sprintId));
    } else {
      onSelectSprint([...selectedSprints, sprintId]);
    }
  };

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Sprint</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSprints.map(sprint => (
            <tr key={sprint.id}>
              <td>{sprint.name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={selectedSprints.includes(sprint.id)}
                  onChange={() => handleCheck(sprint.id)}
                  id={`sprint-checkbox-${sprint.id}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
        <span style={{ margin: '0 1rem' }}>Página {page} de {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Siguiente</button>
      </div>
    </div>
  );
};

export default SprintTable;