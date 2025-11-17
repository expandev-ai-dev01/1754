/**
 * @summary
 * Manages the SQL Server database connection pool.
 *
 * @module instances/database
 */
import sql, { ConnectionPool } from 'mssql';
import { config } from '@/config';

let pool: ConnectionPool;

/**
 * Initializes the database connection pool.
 * Throws an error if the connection fails.
 */
export const initializeDbConnection = async (): Promise<void> => {
  try {
    const dbConfig = {
      user: config.database.user,
      password: config.database.password,
      server: config.database.server,
      database: config.database.database,
      port: config.database.port,
      options: {
        encrypt: config.database.options.encrypt,
        trustServerCertificate: config.database.options.trustServerCertificate,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };
    pool = await new ConnectionPool(dbConfig).connect();
  } catch (err) {
    console.error('Database connection failed:', err);
    throw new Error('Failed to connect to the database.');
  }
};

/**
 * Gets the active connection pool.
 * Throws an error if the pool has not been initialized.
 * @returns {ConnectionPool} The active mssql connection pool.
 */
export const getPool = (): ConnectionPool => {
  if (!pool) {
    throw new Error(
      'Database connection pool has not been initialized. Call initializeDbConnection first.'
    );
  }
  return pool;
};
