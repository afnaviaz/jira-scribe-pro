import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import ProjectSelector from './components/ProjectSelector';
import SprintSelector from './components/SprintSelector';
import StoryList from './components/StoryList';
import ActionPanel from './components/ActionPanel';
import ResultadosDisplay from './components/ResultadosDisplay';
import Sidebar from './components/sidebar';
import Modal from './components/Modal';
import CasosGuardadosScreen from './components/CasosGuardadosScreen';
import TestPlanScreen from './components/TestPlanScreen';
import './index.css';

// Placeholder para componentes de pantalla no implementados
const BacklogScreen = () => (
    <div className="page-container">
        <header className="page-header">
            <h1 className="page-title">Backlog de Pruebas</h1>
        </header>
    </div>
);

const MainApp = () => {
    const { isResultsModalOpen, setIsResultsModalOpen } = useContext(AppContext);
    const [selectedMenu, setSelectedMenu] = useState('generator');
    
    const pageTitles = {
        generator: 'Generador de Casos de Prueba',
        planPruebas: 'Plan de Pruebas',
        casosGuardados: 'Casos de Prueba Guardados',
        backlog: 'Backlog de Pruebas' // Ejemplo
    };

    return (
        <div className="app-layout">
            <Sidebar selected={selectedMenu} onSelect={setSelectedMenu} />
            <div className="app-content-wrapper">
                {selectedMenu === 'generator' && (
                    <div className="page-container">
                        <header className="page-header">
                            <h1 className="page-title">
                                {pageTitles[selectedMenu] || 'Generador de Casos de Prueba'}
                            </h1>
                        </header>
                        <main>
                            <div className="selectors">
                                <ProjectSelector />
                            </div>
                            <SprintSelector />
                            <div className="content-area">
                                <StoryList />
                                <div className="actions-and-results">
                                    <ActionPanel />
                                </div>
                            </div>
                        </main>
                    </div>
                )}
                {selectedMenu === 'backlog' && (
                    <BacklogScreen />
                )}
                {selectedMenu === 'planPruebas' && (
                    <TestPlanScreen />
                )}
                {selectedMenu === 'casosGuardados' && (
                    <CasosGuardadosScreen />
                )}
            </div>

            <Modal
                isOpen={isResultsModalOpen}
                onClose={() => setIsResultsModalOpen(false)}
                title="Casos de Prueba Generados"
            >
                <ResultadosDisplay />
            </Modal>
        </div>
    );
};

export default function App() {
    // El AppProvider ya está en index.jsx, envolviendo este componente.
    return <MainApp />;
}
