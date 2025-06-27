import React, { useState, useEffect } from 'react';
import { getSavedTestCases } from '../services/api';

export default function CasosGuardadosScreen() {
  const [savedCases, setSavedCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedCases = async () => {
      try {
        setIsLoading(true);
        const data = await getSavedTestCases();
        setSavedCases(data);
      } catch (err) {
        setError('No se pudieron cargar los casos guardados.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedCases();
  }, []);

  if (isLoading) return <div>Cargando casos guardados...</div>;
  if (error) return <div className="feedback-message error">{error}</div>;

  return (
    <div className="results-display-container" style={{ padding: 32, marginTop: 0 }}>
      <h2>Casos Guardados</h2>
      {savedCases.length > 0 ? (
        savedCases.map(caso => (
          <div key={caso.id} className="result-story-block">
            <h3 className="result-story-key">{caso.story_key}</h3>
            <p className="result-story-summary">{caso.story_summary}</p>
            <pre className="result-textarea" style={{ whiteSpace: 'pre-wrap', background: '#f7f8fa', border: 'none' }}>
              {Array.isArray(caso.test_cases) ? caso.test_cases.join('\n\n') : caso.test_cases}
            </pre>
          </div>
        ))
      ) : (
        <div>No hay casos de prueba generados.</div>
      )}
    </div>
  );
}