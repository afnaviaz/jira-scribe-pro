import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { getProjects } from '../services/api';

const ProjectSelector = () => {
    const {
        setProjects,
        setError,
        selectedProject,
        setSelectedProject,
        setSprints,
        setStories,
        setSelectedSprints,
        setSelectedStories,
        setGeneratedContent, // Correcto
        generatedContent,    // Correcto
        setStoriesWithCases  // Añadido para desestructurar
    } = useContext(AppContext);

    const [projects, setProjectsState] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsData = await getProjects(); // getProjects() ya devuelve el array de datos
                setProjects(projectsData);
                setProjectsState(projectsData);
            } catch (err) {
                setError('Error al cargar los proyectos de Jira.');
            }
        };
        fetchProjects();
    }, [setProjects, setError]); // Se mantiene para asegurar que se ejecuta si el contexto cambia, pero podría simplificarse a [] si el contexto es estable.

    const handleProjectChange = (e) => {
        const newProjectKey = e.target.value;
        if (generatedContent && generatedContent.length > 0) {
            const confirmChange = window.confirm(
                "Cambiar de proyecto eliminará los casos de prueba generados y la selección actual. ¿Deseas continuar?"
            );
            if (!confirmChange) return;
            // Limpiar áreas relacionadas
            setGeneratedContent([]); // Cambiado a array vacío
            setSprints([]);
            setStories([]);
            setSelectedSprints([]);
            setSelectedStories([]);
            setStoriesWithCases([]); // Limpiar historias con casos generados
        }
        setSelectedProject(projects.find(p => p.key === newProjectKey));
    };

    if (!projects) return <div>Cargando proyectos...</div>;

    return (
        <div className="selector-container">
            <label htmlFor="project-select" className="selector-label">Proyecto</label>
            <select
                id="project-select"
                value={selectedProject ? selectedProject.key : ''}
                onChange={handleProjectChange}
                className="selector-dropdown"
            >
                <option value="">-- Selecciona un Proyecto --</option>
                {projects.map(project => (
                    <option key={project.key} value={project.key}>
                        {project.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ProjectSelector;