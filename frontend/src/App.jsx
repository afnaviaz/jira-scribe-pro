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
import './index.css';
const MainApp = () => {
    const { isResultsModalOpen, setIsResultsModalOpen } = useContext(AppContext);
    const [selectedMenu, setSelectedMenu] = useState('generator');
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar selected={selectedMenu} onSelect={setSelectedMenu} />
            <div style={{ flex: 1, background: '#f7f8fa', minHeight: '100vh' }}>
                {selectedMenu === 'generator' && (
                    <div className="container">
                        <header style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            padding: '24px 0 16px 0',
                            borderBottom: '2px solid #e0e0e0',
                            marginBottom: 24,
                            background: '#f7f8fa'
                        }}>
                            {/* Icono QA */}
                            <span style={{
                                fontSize: 40,
                                color: '#2835a7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                
                            </span>
                            {/* Logo Finkargo */}
                            <img
                                src="/qaia.png"
                                alt="Finkargo"
                                style={{ height: 100, marginRight: 10, borderRadius: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                            />
                            <div>
                                <h1 style={{
                                    margin: 0,
                                    fontSize: 32,
                                    fontWeight: 800,
                                    letterSpacing: 1,
                                    color: '#1a2257',
                                    aligntext: 'right'
                                }}>
                                    Test Case.
                                </h1>
                                <p style={{
                                    margin: 0,
                                    fontSize: 16,
                                    color: '#2835a7',
                                    fontWeight: 400
                                }}>
                                </p>
                            </div>
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
                    <PlanDePruebasScreen />
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
