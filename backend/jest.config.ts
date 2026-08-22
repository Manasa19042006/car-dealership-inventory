import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest to transform TypeScript files
  preset: 'ts-jest',

  // Run in Node environment (not browser)
  testEnvironment: 'node',

  // Where Jest looks for test files
  roots: ['<rootDir>/src'],

  // Match test files: *.test.ts or *.spec.ts
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts', '**/*.spec.ts'],

  // Transform TypeScript using ts-jest
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },

  // Module file extensions Jest will resolve
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Load test environment variables before each test file
  setupFiles: ['<rootDir>/src/tests/setup/env.ts'],

  // Global setup/teardown — runs once before/after the entire suite
  globalSetup: '<rootDir>/src/tests/setup/globalSetup.ts',
  globalTeardown: '<rootDir>/src/tests/setup/globalTeardown.ts',

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',         // Entry point — not unit testable
    '!src/tests/**',          // Exclude test files themselves
    '!src/**/*.d.ts',         // Exclude type declarations
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Show individual test results
  verbose: true,

  // Run tests serially — prevents DB race conditions
  maxWorkers: 1,

  // Timeout per test (10s — allows for DB operations)
  testTimeout: 10000,

  // Clear mocks between every test automatically
  clearMocks: true,
  restoreMocks: true,
};

export default config;
