import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma Client instance.
 *
 * In development, Next.js / ts-node-dev hot-reloads modules which would
 * create a new PrismaClient on every reload and exhaust the connection pool.
 * The globalThis trick keeps a single instance alive across hot reloads.
 *
 * In production a fresh instance is always created at startup.
 */

// Extend the NodeJS global type to hold our prisma instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
