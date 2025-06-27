import express from 'express';
import * as OpenAIService from '../services/openai.service.js';
import * as GeminiService from '../services/gemini.service.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { stories, type } = req.body;

  if (!stories || stories.length === 0) {
    return res.status(400).json({ message: 'Se requiere al menos una historia de usuario.' });
  }

  try {
    let result;

    // Llama a generateContent (OpenAI)
    if (type === 'openai') {
      result = await OpenAIService.generateContent(stories, type);
    } 
    // Llama a generateCasesWithGemini (Gemini)
    else if (type === 'gemini') {
      result = await GeminiService.generateCasesWithGemini(stories);
    } else {
      return res.status(400).json({ message: 'Tipo de generación no soportado.' });
    }

    res.json({ result });
  } catch (error) {
    console.error('Error en el servicio de generación:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error al comunicarse con el servicio de generación.' });
  }
});

export default router;