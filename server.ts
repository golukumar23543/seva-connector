import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/api.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with reasonable limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', platform: 'SevaConnect', timestamp: new Date().toISOString() });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Catch-all for undefined /api routes so they return JSON, never the SPA HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl || req.url} not found` });
  });

  // Vite middleware in development vs Static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SevaConnect] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
