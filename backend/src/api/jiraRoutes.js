import express from 'express';
import * as JiraService from '../services/jira.service.js';

const router = express.Router();

// NOTE: Add your other Jira-related routes (getProjects, getSprints, etc.) here for better organization.

router.post('/create-bug', async (req, res) => {
  const { projectKey, summary, description, parentKey } = req.body;
  if (!projectKey || !summary || !description || !parentKey) {
    return res.status(400).json({ message: 'Missing required fields to create bug.' });
  }
  try {
    const newBug = await JiraService.createBugInJira({ projectKey, summary, description, parentKey });
    res.status(201).json(newBug);
  } catch (error) {
    const errorMessage = error.response?.data?.errorMessages?.join(', ') || 'Error creating bug in Jira.';
    console.error('Error creating bug in Jira:', error.response?.data || error);
    res.status(500).json({ message: errorMessage });
  }
});

export default router;