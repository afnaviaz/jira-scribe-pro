import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// --- Iconos SVG para un look más moderno ---
const IconGenerator = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconTestPlan = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <path d="m9 14 2 2 4-4"></path>
  </svg>
);

const IconSavedCases = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
  </svg>
);

export default function Sidebar({ selected, onSelect }) {
  const { generatedContent } = useContext(AppContext);

  // El plan de pruebas se habilita si hay historias seleccionadas Y se han generado casos para ellas.
  const planDePruebasHabilitado = generatedContent && generatedContent.length > 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/qaia.png" alt="Logo" className="sidebar-logo" />
        <h1 className="sidebar-title">Test Case.</h1>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-button ${selected === 'generator' ? 'active' : ''}`}
          onClick={() => onSelect('generator')}
        >
          <IconGenerator />
          <span>Casos de Prueba</span>
        </button>
        <button
          className={`sidebar-button ${selected === 'planPruebas' ? 'active' : ''}`}
          disabled={!planDePruebasHabilitado}
          onClick={() => onSelect('planPruebas')}
          title={!planDePruebasHabilitado ? "Selecciona historias y genera casos primero" : "Generar Plan de Pruebas"}
        >
          <IconTestPlan />
          <span>Plan de Pruebas</span>
        </button>
        <button
          className={`sidebar-button ${selected === 'casosGuardados' ? 'active' : ''}`}
          onClick={() => onSelect('casosGuardados')}
        >
          <IconSavedCases />
          <span>Casos Guardados</span>
        </button>
      </nav>
    </aside>
  );
}