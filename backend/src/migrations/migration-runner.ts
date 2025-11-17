/**
 * Database Migration Runner
 *
 * Automatically runs database migrations on application startup.
 * This module executes SQL scripts from the migrations folder to set up
 * or update the database schema without requiring external tools.
 */

import sql from 'mssql';
import * as fs from 'fs/promises';
import * as path from 'path';

interface MigrationConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
  encrypt: boolean;
}

interface MigrationRecord {
  id: number;
  filename: string;
  executed_at: Date;
  checksum: string;
}

export class MigrationRunner {
  private config: sql.config;
  private migrationsPath: string;

  constructor(config: MigrationConfig, migrationsPath: string = './migrations') {
    this.config = {
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      options: {
        encrypt: config.encrypt,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    };
    this.migrationsPath = path.resolve(migrationsPath);
  }

  /**
   * Initialize migration tracking table
   */
  private async initializeMigrationTable(pool: sql.ConnectionPool): Promise<void> {
    const createTableSQL = `
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'migrations' AND schema_id = SCHEMA_ID('dbo'))
      BEGIN
        CREATE TABLE [dbo].[migrations] (
          [id] INT IDENTITY(1,1) PRIMARY KEY,
          [filename] NVARCHAR(255) NOT NULL UNIQUE,
          [executed_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
          [checksum] NVARCHAR(64) NOT NULL
        );
        PRINT 'Migration tracking table created successfully';
      END
    `;

    await pool.request().query(createTableSQL);
    console.log('✓ Migration tracking table initialized');
  }

  /**
   * Get list of already executed migrations
   */
  private async getExecutedMigrations(pool: sql.ConnectionPool): Promise<Set<string>> {
    try {
      const result = await pool.request().query<MigrationRecord>(
        'SELECT filename FROM [dbo].[migrations] ORDER BY id'
      );
      return new Set(result.recordset.map(r => r.filename));
    } catch (error) {
      console.log('No previous migrations found');
      return new Set();
    }
  }

  /**
   * Calculate checksum for migration file
   */
  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Record migration execution
   */
  private async recordMigration(
    pool: sql.ConnectionPool,
    filename: string,
    checksum: string
  ): Promise<void> {
    await pool.request()
      .input('filename', sql.NVarChar(255), filename)
      .input('checksum', sql.NVarChar(64), checksum)
      .query(`
        INSERT INTO [dbo].[migrations] (filename, checksum)
        VALUES (@filename, @checksum)
      `);
  }

  /**
   * Execute a single migration file
   */
  private async executeMigration(
    pool: sql.ConnectionPool,
    filename: string,
    content: string
  ): Promise<void> {
    console.log(`\n→ Executing migration: ${filename}`);

    // Split by GO statements (SQL Server batch separator)
    const batches = content
      .split(/^\s*GO\s*$/im)
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0);

    console.log(`  Found ${batches.length} SQL batches to execute`);

    for (let i = 0; i < batches.length; i++) {
      try {
        await pool.request().query(batches[i]);
        console.log(`  ✓ Batch ${i + 1}/${batches.length} executed`);
      } catch (error: any) {
        console.error(`  ✗ Batch ${i + 1}/${batches.length} failed:`);
        console.error(`    ${error.message}`);
        throw new Error(`Migration ${filename} failed at batch ${i + 1}: ${error.message}`);
      }
    }

    const checksum = this.calculateChecksum(content);
    await this.recordMigration(pool, filename, checksum);
    console.log(`✓ Migration ${filename} completed successfully`);
  }

  /**
   * Get all migration files sorted by name
   */
  private async getMigrationFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(f => f.endsWith('.sql'))
        .sort(); // Sort alphabetically (assuming timestamp prefix)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️  Migrations directory not found: ${this.migrationsPath}`);
        console.warn(`   This is normal if no database migrations were generated.`);
      } else {
        console.error(`Error reading migrations directory: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Drop all user tables (except migrations tracking table)
   */
  private async dropAllTables(pool: sql.ConnectionPool): Promise<void> {
    console.log('→ Dropping all existing tables...');

    // Get all user tables (excluding system tables and migrations table)
    const result = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_SCHEMA = 'dbo'
        AND TABLE_NAME != 'migrations'
    `);

    const tables = result.recordset;

    if (tables.length === 0) {
      console.log('  ✓ No existing tables to drop');
      return;
    }

    console.log(`  Found ${tables.length} tables to drop`);

    // Drop all foreign key constraints first
    const fkResult = await pool.request().query(`
      SELECT
        fk.name AS constraint_name,
        OBJECT_NAME(fk.parent_object_id) AS table_name
      FROM sys.foreign_keys fk
    `);

    for (const fk of fkResult.recordset) {
      try {
        await pool.request().query(`
          ALTER TABLE [${fk.table_name}] DROP CONSTRAINT [${fk.constraint_name}]
        `);
        console.log(`  ✓ Dropped FK constraint: ${fk.constraint_name}`);
      } catch (error: any) {
        console.warn(`  ⚠️  Failed to drop FK constraint ${fk.constraint_name}: ${error.message}`);
      }
    }

    // Now drop all tables
    for (const table of tables) {
      try {
        await pool.request().query(`
          DROP TABLE [${table.TABLE_SCHEMA}].[${table.TABLE_NAME}]
        `);
        console.log(`  ✓ Dropped table: ${table.TABLE_NAME}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to drop table ${table.TABLE_NAME}: ${error.message}`);
        throw error;
      }
    }

    console.log('✓ All tables dropped successfully\n');
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    console.log('\n========================================');
    console.log('DATABASE MIGRATION RUNNER (REPLACE MODE)');
    console.log('========================================\n');

    let pool: sql.ConnectionPool | null = null;

    try {
      console.log('→ Connecting to database...');
      pool = await sql.connect(this.config);
      console.log('✓ Database connection established\n');

      // Initialize migration tracking
      await this.initializeMigrationTable(pool);

      // Get all migration files
      const migrationFiles = await this.getMigrationFiles();
      console.log(`→ Found ${migrationFiles.length} migration files\n`);

      if (migrationFiles.length === 0) {
        console.log('✓ No migrations to run\n');
        return;
      }

      // DROP ALL TABLES (fresh start every time)
      console.log('🔥 REPLACE MODE: Dropping all existing tables...\n');
      await this.dropAllTables(pool);

      // Clear migration history (fresh tracking)
      console.log('→ Clearing migration history...');
      await pool.request().query('DELETE FROM [dbo].[migrations]');
      console.log('✓ Migration history cleared\n');

      // Execute ALL migrations (fresh database)
      console.log(`→ Running ${migrationFiles.length} migrations...\n`);

      for (const filename of migrationFiles) {
        const filePath = path.join(this.migrationsPath, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        await this.executeMigration(pool, filename, content);
      }

      console.log('\n========================================');
      console.log('✓ ALL MIGRATIONS COMPLETED SUCCESSFULLY');
      console.log('✓ DATABASE RECREATED FROM SCRATCH');
      console.log('========================================\n');

    } catch (error: any) {
      console.error('\n========================================');
      console.error('✗ MIGRATION FAILED');
      console.error('========================================');
      console.error(`Error: ${error.message}\n`);
      throw error;
    } finally {
      if (pool) {
        await pool.close();
        console.log('→ Database connection closed\n');
      }
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const pool = await sql.connect(this.config);
      await pool.close();
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Initialize and run migrations from environment variables
 */
export async function runDatabaseMigrations(options?: {
  skipIfNoNewMigrations?: boolean;
  logLevel?: 'silent' | 'minimal' | 'verbose';
}): Promise<void> {
  const skipIfNoNewMigrations = options?.skipIfNoNewMigrations ?? true;
  const logLevel = options?.logLevel ?? 'minimal';

  // Skip migrations entirely if disabled via environment variable
  if (process.env.SKIP_MIGRATIONS === 'true') {
    if (logLevel !== 'silent') {
      console.log('ℹ️  Migrations skipped (SKIP_MIGRATIONS=true)');
    }
    return;
  }

  // Validate required environment variables
  const requiredEnvVars = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const error = `Missing required database environment variables: ${missingVars.join(', ')}`;
    console.error('❌ Migration Configuration Error:');
    console.error(`   ${error}`);
    console.error('\n   Please ensure the following environment variables are configured in Azure App Service:');
    console.error('   - DB_SERVER (e.g., your-server.database.windows.net)');
    console.error('   - DB_NAME (e.g., your-database)');
    console.error('   - DB_USER (e.g., your-admin-user)');
    console.error('   - DB_PASSWORD (your database password)');
    console.error('   - DB_PORT (optional, defaults to 1433)');
    console.error('   - DB_ENCRYPT (optional, defaults to false)\n');
    throw new Error(error);
  }

  const config: MigrationConfig = {
    server: process.env.DB_SERVER!,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    encrypt: process.env.DB_ENCRYPT === 'true'
  };

  // Migrations are located in the root 'migrations' folder of the backend
  // When running from dist/, we need to go up to project root and find migrations
  // When running from src/, same thing
  const migrationsPath = process.env.MIGRATIONS_PATH || path.join(__dirname, '../../migrations');

  const runner = new MigrationRunner(config, migrationsPath);

  // Check if there are any migration files
  const migrationFiles = await runner['getMigrationFiles']();

  if (migrationFiles.length === 0) {
    if (logLevel === 'verbose') {
      console.log('✓ No migration files found - skipping migration');
    }
    return;
  }

  // REPLACE MODE: Always run migrations (drop all tables and recreate)
  // This ensures each deploy gets a fresh database schema
  if (logLevel !== 'silent') {
    console.log('🔥 Running migrations in REPLACE mode (database will be recreated)');
  }

  await runner.runMigrations();
}
