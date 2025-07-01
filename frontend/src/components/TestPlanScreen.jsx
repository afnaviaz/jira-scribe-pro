import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

const Spinner = () => <div className="spinner-simple" />;

const TestPlanScreen = () => {
  const {
    testPlan,
    setTestPlan,
    isTestPlanLoading,
    handleGenerateTestPlan,
    error,
    setError,
    storiesForPlan,
  } = useContext(AppContext);

  const [editableTestPlan, setEditableTestPlan] = useState(testPlan);

  useEffect(() => {
    // Genera el plan automáticamente si no existe
    if (storiesForPlan.length > 0 && !testPlan && !isTestPlanLoading) {
      handleGenerateTestPlan();
    }
    // Sincroniza el estado local cuando el del contexto cambia
    setEditableTestPlan(testPlan);
  }, [testPlan, storiesForPlan, isTestPlanLoading, handleGenerateTestPlan]);

  return (
    <div className="test-plan-container">
      <h2>Plan de Pruebas</h2>
      <p className="test-plan-subtitle">
        Este es un plan de pruebas generado por IA basado en las historias de usuario para las que se generaron casos de prueba. Puedes editar el contenido directamente.
      </p>

      {isTestPlanLoading && (
        <div className="loading-container">
          <Spinner />
          <p>Generando plan de pruebas...</p>
        </div>
      )}

      {error && !isTestPlanLoading && <div className="feedback-message error">{error}</div>}

      {!isTestPlanLoading && testPlan && (
        <textarea className="test-plan-textarea" value={editableTestPlan} onChange={(e) => setEditableTestPlan(e.target.value)} rows={30} />
      )}
    </div>
  );
};

export default TestPlanScreen;