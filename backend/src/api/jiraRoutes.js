import express from 'express';
import * as JiraService from '../services/jira.service.js';

const router = express.Router();

router.get('/projects', async (req, res) => {
  try {
    const projects = await JiraService.getProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error en /projects:', error.response?.data || error.message || error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/sprints/:projectKey', async (req, res) => {
  try {
    const sprints = await JiraService.getSprintsByProject(req.params.projectKey);
    res.json(sprints);
  } catch (error) {
    console.error(`Error en /sprints/${req.params.projectKey}:`, error.response?.data || error.message || error);
    res.status(500).json({ message: error.message, details: error.response?.data });
  }
});

router.get('/stories/:sprintId', async (req, res) => {
  const { sprintId } = req.params;
  try {
    const stories = await JiraService.getStoriesBySprint(sprintId);
    res.json(stories);
  } catch (error) {
    console.error(`Error en /stories/${sprintId}:`, error.response?.data || error.message || error);
    res.status(500).json({ message: error.message, details: error.response?.data });
  }
});

router.post('/add-comment', async (req, res) => {
  const { storyKey, comment } = req.body;
  try {
    await JiraService.addCommentToJira(storyKey, comment);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al añadir comentario a Jira:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Error al añadir comentario a Jira', details: error.response?.data });
  }
});

export default router;