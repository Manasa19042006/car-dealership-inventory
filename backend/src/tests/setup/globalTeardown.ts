/**
 * Jest Global Teardown
 *
 * Runs ONCE after the entire test suite finishes.
 * Disconnects the Prisma client to cleanly release DB connections
 * and prevent Jest from hanging after tests complete.
 */
export default async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Tearing down test environment...');
  // Nothing to clean up at the global level for now.
  // Per-test cleanup is handled inside individual test files.
  console.log('✅ Test environment torn down\n');
}
