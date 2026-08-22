/**
 * Jest Global Setup
 *
 * Runs ONCE before the entire test suite starts.
 * Use this for one-time setup tasks such as:
 * - Verifying the test database is reachable
 * - Running migrations on the test DB
 *
 * NOTE: This file runs in a separate context from tests,
 * so it cannot share variables with test files directly.
 */
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export default async function globalSetup(): Promise<void> {
  // Load test env variables for this setup context
  const testEnvPath = path.resolve(__dirname, '../../../.env.test');
  const defaultEnvPath = path.resolve(__dirname, '../../../.env');

  if (fs.existsSync(testEnvPath)) {
    dotenv.config({ path: testEnvPath });
  } else {
    dotenv.config({ path: defaultEnvPath });
  }

  process.env.NODE_ENV = 'test';

  console.log('\n🧪 Setting up test environment...');
  console.log(`   DATABASE_URL: ${maskUrl(process.env.DATABASE_URL ?? 'NOT SET')}`);

  try {
    // Push the Prisma schema to the test database without creating migration files.
    // `prisma db push` is ideal for test DBs — fast and non-destructive to migration history.
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('✅ Test database schema is up to date\n');
  } catch (error) {
    console.error('❌ Failed to push schema to test database:', error);
    throw error;
  }
}

/**
 * Masks the password in a database URL for safe logging.
 * e.g. postgresql://postgres:secret@localhost/db → postgresql://postgres:***@localhost/db
 */
function maskUrl(url: string): string {
  return url.replace(/:([^@]+)@/, ':***@');
}
