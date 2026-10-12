import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './routes/api.ts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares
app.use(express.json());

// CORS Middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/v1', apiRouter);
// Also support /api directly
app.use('/api', apiRouter);

// Serve production frontend assets if dist exists
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log(`[Server] Serving static production assets from ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
export const server = app.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(`🏭 Textile Factory Audit Platform - Backend Engine`);
  console.log(`⚡ API Server running at http://${HOST}:${PORT}`);
  console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/v1/health`);
  console.log(`📋 Summary API:     http://localhost:${PORT}/api/v1/companies/TexAlpha%20Mills/summary`);
  console.log(`🔬 Readings API:    http://localhost:${PORT}/api/v1/companies/TexAlpha%20Mills/readings?limit=20`);
  console.log(`⚖️  Audit Compare:   http://localhost:${PORT}/api/v1/audit/compare`);
  console.log('====================================================');
});

export default app;
