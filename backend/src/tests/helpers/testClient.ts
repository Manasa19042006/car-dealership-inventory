/**
 * Shared Prisma client for tests.
 *
 * Each test file that needs DB access imports this client.
 * It reads DATABASE_URL from the environment (set by env.ts setup file).
 *
 * Usage in tests:
 *   import testPrisma from '../helpers/testClient';
 *   afterEach(async () => { await testPrisma.user.deleteMany(); });
 *   afterAll(async () => { await testPrisma.$disconnect(); });
 */
import { PrismaClient } from '@prisma/client';

const testPrisma = new PrismaClient({
  // Only log errors during tests to keep output clean
  log: ['error'],
});

export default testPrisma;
