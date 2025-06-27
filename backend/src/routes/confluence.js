import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const router = express.Router();

// Ejemplo de endpoint para exportar a Confluence
router.post('/export', async (req, res) => {
  const { spaceKey, title, content, parentId } = req.body;
  try {
    const response = await axios.post(
      `${process.env.CONFLUENCE_URL}/rest/api/content`,
      {
        type: 'page',
        title,
        space: { key: spaceKey },
        ancestors: parentId ? [{ id: parentId }] : [],
        body: {
          storage: {
            value: content,
            representation: 'wiki'
          }
        }
      },
      {
        auth: {
          username: process.env.CONFLUENCE_USER,
          password: process.env.CONFLUENCE_TOKEN
        },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    res.json({ success: true, pageId: response.data.id });
  } catch (err) {
    res.status(500).json({ error: 'Error exportando a Confluence', details: err.message });
  }
});

// Aquí puedes agregar tus endpoints para Confluence

export default router;