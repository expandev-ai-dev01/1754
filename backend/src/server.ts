/**
 * @summary
 * Main server entry point for the StockBox API.
 * Configures and starts the Express application.
 *
 * @module server
 */
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { config } from '@/config';
import { errorMiddleware } from '@/middleware/errorMiddleware';
import { notFoundMiddleware } from '@/middleware/notFoundMiddleware';
import apiRoutes from '@/routes';
import { initializeDbConnection } from '@/instances/database';

const app: Application = express();

// --- Core Middleware Setup ---
app.use(helmet()); // Set various HTTP headers for security
app.use(cors(config.api.cors)); // Enable Cross-Origin Resource Sharing
app.use(compression()); // Compress response bodies
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// --- Health Check Endpoint ---
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---
// All API routes are prefixed with /api and versioned.
// e.g., /api/v1/internal/..., /api/v1/external/...
app.use('/api', apiRoutes);

// --- Error Handling Middleware ---
app.use(notFoundMiddleware); // Handle 404 Not Found errors
app.use(errorMiddleware); // Centralized error handler

// --- Application Startup ---
const startServer = async () => {
  try {
    console.log('Attempting to connect to the database...');
    await initializeDbConnection();
    console.log('✓ Database connection successful.');

    app.listen(config.api.port, () => {
      console.log(`\n🚀 Server is running on port ${config.api.port} in ${config.nodeEnv} mode.`);
      console.log(
        `   API available at http://localhost:${config.api.port}/api/${config.api.version}`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start the server:');
    console.error(error);
    process.exit(1);
  }
};

startServer();
