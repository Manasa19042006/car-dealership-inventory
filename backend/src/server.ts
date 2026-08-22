import dotenv from 'dotenv';

// Load environment variables BEFORE importing anything that reads process.env
dotenv.config();

import app from './app';
import prisma from './config/database';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

/**
 * Verify the database connection before starting the HTTP server.
 * Uses a lightweight $queryRaw to confirm PostgreSQL is reachable.
 */
async function startServer(): Promise<void> {
  try {
    // Minimal DB connectivity check — sends a trivial query to PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    console.error('   Make sure PostgreSQL is running and DATABASE_URL is set correctly in .env');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚗 Car Dealership API is running on http://localhost:${PORT}`);
    console.log(`📋 Health check:          http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment:           ${process.env.NODE_ENV ?? 'development'}`);
  });
}

// Handle graceful shutdown — disconnect Prisma on process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🔌 Database disconnected. Goodbye.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
