import fs from 'fs';
import path from 'path';

export function verifyMigrations(): void {
  console.log('Verifying TindaHalin SQLite Schema Migrations...');
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  const migrationPath = path.join(process.cwd(), 'database', 'migrations', '001_initial.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error('schema.sql file missing in /database');
  }
  if (!fs.existsSync(migrationPath)) {
    throw new Error('001_initial.sql file missing in /database/migrations');
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  const requiredTables = [
    'stores',
    'products',
    'sales',
    'sale_items',
    'payments',
    'inventory_movements',
    'customers',
    'credit_entries',
    'sync_outbox',
  ];

  for (const table of requiredTables) {
    if (!schemaSql.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      throw new Error(`Migration verification failed: Missing table ${table}`);
    }
  }

  console.log('✅ Migration verification passed! All 9 SQLite tables validated.');
}

if (require.main === module) {
  verifyMigrations();
}
