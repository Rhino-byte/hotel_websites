import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

// Static files
app.use(express.static(__dirname));

// Serve the Home page at root to avoid "Cannot GET /"
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'Home', 'index.html'));
});

// Proxy endpoint for SerpAPI Google Images
app.get('/api/images', async (req, res) => {
  try {
    const q = (req.query.q || '').toString();
    if (!q) return res.status(400).json({ error: 'Missing q' });
    const apiKey = process.env.SERPER_API_KEY || process.env.SERPAPI_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing SERPER_API_KEY on server' });

    // Prefer Serper.dev Images API (POST)
    const serperUrl = 'https://google.serper.dev/images';
    const body = {
      q,
      location: 'Kenya',
      gl: 'ke'
    };
    const r = await fetch(serperUrl, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) return res.status(r.status).json({ error: 'Serper error' });
    const data = await r.json();
    // Normalize response to a common shape used by the frontend
    const images_results = (data.images || []).map(i => ({
      original: i.imageUrl || i.thumbnailUrl || i.source || '',
      thumbnail: i.thumbnailUrl || i.imageUrl || ''
    })).filter(x => x.original);
    res.json({ images_results });
  } catch (e) {
    res.status(500).json({ error: 'Internal error' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

