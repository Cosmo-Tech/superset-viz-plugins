/** @type {import('jest').Config} */
module.exports = {
  displayName: '@cosmotech-viz/core',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  passWithNoTests: true,
};
