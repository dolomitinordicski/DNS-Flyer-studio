import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());
  app.use('/assets', express.static(path.join(process.cwd(), 'public/assets')));
  app.use('/public', express.static(path.join(process.cwd(), 'public')));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Dolomiti NordicSki Flyer Generator' });
  });

  // Vite middleware for development vs static serve for production
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
    console.log(`Dolomiti NordicSki Flyer Generator running on http://localhost:${PORT}`);
  });
}

startServer();
