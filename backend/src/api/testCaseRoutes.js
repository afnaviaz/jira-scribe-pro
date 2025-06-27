// src/api/testCaseRoutes.js
import express from 'express';
const router = express.Router();

let testCasesStore = []; // <-- Aquí se guardarán los casos en memoria

// Guardar casos de prueba
router.post('/save', async (req, res) => {
  const { storyKey, storySummary, testCases } = req.body;
  testCasesStore.push({ storyKey, storySummary, testCases });
  res.json({ success: true, message: 'Casos de prueba guardados', storyKey });
});

// Listar casos de prueba guardados
router.get('/', async (req, res) => {
  res.json(testCasesStore);
});

export default router;