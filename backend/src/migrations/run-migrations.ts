/**
 * Standalone migration runner script
 *
 * This script can be run independently or as part of the application startup.
 * Usage: ts-node run-migrations.ts
 */

import { runDatabaseMigrations } from './migration-runner';

async function main() {
  try {
    console.log('Starting database migration process...\n');
    await runDatabaseMigrations();
    console.log('Migration process completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('Migration process failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
