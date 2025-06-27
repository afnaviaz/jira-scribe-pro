import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import jiraRoutes from './api/jiraRoutes.js';
import openaiRoutes from './api/openaiRoutes.js';
import geminiRoutes from './api/geminiRoutes.js';
import confluenceRoutes from './routes/confluence.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/jira', jiraRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/confluence', confluenceRoutes);

app.get('/', (req, res) => {
  res.send('JiraScribe Pro Backend está corriendo 🚀'); 
});

app.listen(config.port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${config.port}`);
});