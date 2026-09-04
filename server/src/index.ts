import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import reflectionRoutes from './routes/reflectionRoutes';
import chatRoutes from './routes/chatRoutes';
import observatoryRoutes from './routes/observatoryRoutes';
import insightRoutes from './routes/insightRoutes';
import goalRoutes from './routes/goalRoutes';
import predictionRoutes from './routes/predictionRoutes';
import turningPointRoutes from './routes/turningPointRoutes';
import connectionRoutes from './routes/connectionRoutes';

const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible SPA asset loading while securing headers
}));

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/observatory', observatoryRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/turning-points', turningPointRoutes);
app.use('/api/connections', connectionRoutes);

// Serve static frontend in production (Single Container Cloud Run architecture)
const clientBuildPath = path.resolve(__dirname, ENV.CLIENT_DIST_PATH);
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Global safe error handling
app.use(errorHandler);

export default app;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`[Life Observatory Server] Active on port ${ENV.PORT} in ${ENV.NODE_ENV} mode.`);
  });

  process.on('SIGTERM', () => {
    console.log('[Life Observatory Server] Received SIGTERM, shutting down gracefully...');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('[Life Observatory Server] Received SIGINT, shutting down gracefully...');
    server.close(() => process.exit(0));
  });
}
