/**
 * @summary
 * Centralized configuration management.
 * Loads environment variables from .env file and provides a typed config object.
 *
 * @module config
 */
import dotenv from 'dotenv';

dotenv.config();

const getCorsOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.CORS_ORIGINS?.split(',') || [];
  }
  // Allow multiple local ports for development
  return ['http://localhost:3000', 'http://localhost:5173'];
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.NODE_ENV !== 'production',
    },
  },
  api: {
    port: parseInt(process.env.PORT || '3001', 10),
    version: process.env.API_VERSION || 'v1',
    cors: {
      origin: getCorsOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  },
};
