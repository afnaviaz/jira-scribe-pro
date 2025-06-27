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

    // 1. Cargar sprints al seleccionar proyecto y seleccionar el sprint más reciente por defecto
    useEffect(() => {
        const fetchSprintsAndSetDefault = async () => {
            if (selectedProject) {
                try {
                    const response = await getSprints(selectedProject.key || selectedProject);
                    const fetchedSprints = response.data;
                    setSprints(fetchedSprints);

                    // Seleccionar por defecto el sprint más reciente
                    if (fetchedSprints && fetchedSprints.length > 0) {
                        const sprintsOrdenados = [...fetchedSprints].sort((a, b) => b.id - a.id);
                        const ultimoSprint = sprintsOrdenados[0];
                        // Solo establecer si no hay un sprint seleccionado o si el seleccionado no está entre los nuevos sprints
                        if (!selectedSprints.length || !fetchedSprints.some(s => String(s.id) === selectedSprints[0])) {
                            setSelectedSprints([ultimoSprint.id.toString()]);
                        }
                    } else {
                        setSelectedSprints([]); // Limpiar selección si no hay sprints
                    }
                } catch (err) {
                    setError('Error al cargar los sprints del proyecto seleccionado.');
                }
            } else {
                setSprints([]);
                setSelectedSprints([]); // Limpiar selección si no hay proyecto
            }
            setStories([]); // Siempre limpiar historias al cambiar de proyecto/sprint
        };
        fetchSprintsAndSetDefault();
    }, [selectedProject, setSprints, setError, setSelectedSprints, setStories]); // Dependencias: selectedProject, setSprints, setError, setSelectedSprints, setStories

    // 2. Cargar historias de usuario del sprint seleccionado
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