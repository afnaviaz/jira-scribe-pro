import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const ResultsDisplay = () => {
    const { generatedContent, isLoading, error } = useContext(AppContext);

    if (isLoading) {
        return <div className="spinner">Cargando...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="results-display">
            <h3>Casos de prueba Generados</h3>
            <pre>{generatedContent}</pre>
        </div>
    );
};

export default ResultsDisplay;