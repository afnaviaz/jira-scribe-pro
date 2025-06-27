// src/api/testCaseRoutes.js
import express from 'express';
import fs from 'fs';
const router = express.Router();

const FILE_PATH = './testCasesStore.json';

// Cargar desde archivo
function loadTestCases() {
  if (!fs.existsSync(FILE_PATH)) return [];
  return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
}

// Guardar en archivo
function saveTestCases(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

router.get('/', async (req, res) => {
  res.json(loadTestCases());
});

router.post('/save', async (req, res) => {
  const { sprintName, storyKey, storySummary, testCases } = req.body;
  let store = loadTestCases();
  const idx = store.findIndex(tc => tc.storyKey === storyKey);
  if (idx !== -1) {
    store[idx] = { sprintName, storyKey, storySummary, testCases };
  } else {
    store.push({ sprintName, storyKey, storySummary, testCases });
  }
  saveTestCases(store);
  res.json({ success: true, message: 'Casos de prueba guardados/actualizados', storyKey });
});

export default router;