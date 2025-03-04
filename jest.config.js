/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.ts'],
  verbose: true,
  // Increase timeout for API calls
  testTimeout: 30000,
  // Setup file to load environment variables
  setupFiles: ['dotenv/config'],
}; 