import express from 'express';
import { generateCasesWithGemini } from '../services/gemini.service.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  console.log('POST /api/gemini/generate recibido');
  try {
    const { stories } = req.body;
    const result = await generateCasesWithGemini(stories);
    res.json(result);
  } catch (err) {
    console.error('Error en /api/gemini/generate:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;