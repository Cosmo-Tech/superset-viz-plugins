/** @type {import('jest').Config} */
module.exports = {
  projects: ['<rootDir>/plugins/*/jest.config.js', '<rootDir>/packages/*/jest.config.js'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'plugins/*/src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
  ],
};
