import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { getSprints, getStories } from '../services/api';

const SprintSelector = () => {
    const {
        sprints,
        setSprints,
        setError,
        selectedProject,
        selectedSprints,
        setSelectedSprints,
        setStories,
        stories,
        setGeneratedContent,
        generatedContent,
        setStoriesWithCases // Añadido para desestructurar
    } = useContext(AppContext);

    // Cargar sprints al seleccionar proyecto
    useEffect(() => {
        const fetchSprints = async () => {
            if (selectedProject) {
                try {
                    const response = await getSprints(selectedProject.key || selectedProject);
                    setSprints(response.data);
                } catch (err) {
                    setError('Error al cargar los sprints del proyecto seleccionado.');
                }
            } else {
                setSprints([]);
            }
            setSelectedSprints([]);
            setStories([]);
        };
        fetchSprints();
    }, [selectedProject, setSprints, setError, setSelectedSprints, setStories]);

    // Seleccionar por defecto el sprint más reciente cuando se cargan los sprints
    useEffect(() => {
        if (sprints && sprints.length > 0) {
            const sprintsOrdenados = [...sprints].sort((a, b) => b.id - a.id);
            const ultimoSprint = sprintsOrdenados[0];
            if (!selectedSprints.length) {
                setSelectedSprints([ultimoSprint.id.toString()]);
            }
        }
    }, [sprints, selectedSprints, setSelectedSprints]);

    // Cargar historias de usuario del sprint seleccionado
    useEffect(() => {
        const fetchStories = async () => {
            if (selectedSprints.length > 0) {
                try {
                    const response = await getStories(selectedSprints[0]);
                    setStories(response.data);
                } catch (err) {
                    setError('Error al cargar las historias de usuario.');
                }
            } else {
                setStories([]);
            }
        };
        fetchStories();
    }, [selectedSprints, setStories, setError]);

    const handleSprintChange = (e) => {
        const newSprintId = e.target.value;
        if (generatedContent && generatedContent.length > 0) {
            const confirmChange = window.confirm(
                "Cambiar de sprint eliminará los casos de prueba generados y la selección actual. ¿Deseas continuar?"
            );
            if (!confirmChange) return;
            setGeneratedContent([]); // Cambiado a array vacío
            setStoriesWithCases([]); // Limpiar historias con casos generados
            setStories([]);
        }
        setSelectedSprints([newSprintId]);
    };

    // Ordena los sprints por id descendente y toma los últimos 12
    const sprintsOrdenados = [...sprints]
        .sort((a, b) => b.id - a.id)
        .slice(0, 12);

    // Sprint actual (más reciente)
    const sprintActual = sprintsOrdenados[0];

    return (
        <div className="sprint-selector-wrapper">
            <div className="selector-container">
                <label htmlFor="sprint-select" className="selector-label">Sprint</label>
                
                {/* Etiqueta Sprint actual */}
                {selectedSprints[0] === String(sprintActual?.id) && (
                    <span className="sprint-status-label">
                        EN CURSO 
                    </span>
                )}
                <select
                    id="sprint-select"
                    value={selectedSprints[0] || ''}
                    onChange={handleSprintChange}
                    className="selector-dropdown"
                >
                    <option value="">-- Selecciona un Sprint --</option>
                    {sprintsOrdenados.map(sprint => (
                        <option key={sprint.id} value={sprint.id}>
                            {sprint.name}
                        </option>
                    ))}
                </select>
                
            </div>
            {/* Mensaje si no hay historias */}
            {(!stories || stories.length === 0) && (
                <div className="no-stories-message">
                    No hay Historias de usuario disponibles
                </div>
            )}
        </div>
    );
};

export default SprintSelector;