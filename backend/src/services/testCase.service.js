import { getDb } from './database.service.js';
import express from 'express';

const router = express.Router();

export const saveTestCase = async ({ storyKey, storySummary, testCases }) => {
  const db = getDb();
  // Guardamos los casos de prueba como un string JSON
  const testCasesJson = JSON.stringify(testCases);

  const result = await db.run( // Usamos INSERT OR REPLACE para manejar inserciones y actualizaciones (upsert).
    'INSERT OR REPLACE INTO test_cases (story_key, story_summary, test_cases) VALUES (?, ?, ?)',
    [storyKey, storySummary, testCasesJson]
  );

  return { id: result.lastID, storyKey, storySummary, testCases };
};

export const getSavedTestCases = async () => {
  const db = getDb();
  const rows = await db.all('SELECT * FROM test_cases ORDER BY created_at DESC');

  // Convertimos el string JSON de vuelta a un array al recuperar
  return rows.map(row => ({
    ...row,
    test_cases: JSON.parse(row.test_cases || '[]'),
  }));
};

router.post('/save', async (req, res) => {
  const { storyKey, storySummary, testCases } = req.body;
  // Aquí puedes guardar en base de datos, archivo, etc.
  // Por ahora, solo responde OK
  res.json({ success: true, message: 'Casos de prueba guardados', storyKey });
});

export default router;
