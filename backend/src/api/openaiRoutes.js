import express from 'express';
import * as OpenAIService from '../services/openai.service.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { stories } = req.body;

  if (!stories || stories.length === 0) {
    return res.status(400).json({ message: 'Se requiere al menos una historia de usuario.' });
  }

  try {
    // This route is dedicated to OpenAI, so we call its service directly.
    const result = await OpenAIService.generateContent(stories);
    res.json(result); // Send the array of results directly
  } catch (error) {
    console.error('Error en el servicio de generación de OpenAI:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error al comunicarse con el servicio de OpenAI.' });
  }
});

router.post('/generate-plan', async (req, res) => {
  const { stories } = req.body;
  if (!stories || !Array.isArray(stories) || stories.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de historias de usuario.' });
  }
  try {
    const plan = await OpenAIService.generatePlanDePruebas(stories);
    res.json({ plan });
  } catch (error) {
    console.error('Error generando el plan de pruebas:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error al comunicarse con OpenAI para generar el plan.' });
  }
});

export default router;