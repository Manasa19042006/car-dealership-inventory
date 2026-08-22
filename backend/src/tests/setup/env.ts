/**
 * Test Environment Setup
 *
 * This file runs BEFORE each test file via Jest's `setupFiles` config.
 * It loads environment variables from .env.test if it exists,
 * otherwise falls back to .env — ensuring the test DB is used.
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const testEnvPath = path.resolve(__dirname, '../../../.env.test');
const defaultEnvPath = path.resolve(__dirname, '../../../.env');

// Prefer .env.test over .env for test runs
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
} else {
  dotenv.config({ path: defaultEnvPath });
}

// Force NODE_ENV to 'test' regardless of what .env says
process.env.NODE_ENV = 'test';
