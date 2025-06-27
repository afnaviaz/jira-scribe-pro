import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Sidebar({ selected, onSelect }) { // onPlanClick ya no es necesario
  const { generatedContent } = useContext(AppContext);

  // El plan de pruebas se habilita si hay historias seleccionadas Y se han generado casos para ellas.
  const planDePruebasHabilitado = generatedContent && generatedContent.length > 0;

  return (
    <nav className="sidebar">
      <button
        className={`sidebar-button ${selected === 'generator' ? 'active' : ''}`}
        onClick={() => onSelect('generator')}
      >
        Casos de Prueba
      </button>
      <button
        className={`sidebar-button ${selected === 'planPruebas' ? 'active' : ''}`}
        disabled={!planDePruebasHabilitado}
        onClick={() => onSelect('planPruebas')}
        title={!planDePruebasHabilitado ? "Selecciona historias y genera casos primero" : "Generar Plan de Pruebas"}
      >
        Plan de Pruebas
      </button>
      <button
        className={`sidebar-button ${selected === 'casosGuardados' ? 'active' : ''}`}
        onClick={() => onSelect('casosGuardados')}
      >
        Casos Guardados
      </button>
    </nav>
  );
}