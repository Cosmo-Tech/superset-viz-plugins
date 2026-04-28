/** @type {import('jest').Config} */
module.exports = {
  displayName: '@cosmotech/plugin-{{PACKAGE_NAME}}',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@superset-ui/core$': '<rootDir>/test/__mocks__/superset-ui-core.js',
    '^@superset-ui/chart-controls$': '<rootDir>/test/__mocks__/superset-ui-chart-controls.js',
    '\\.(gif|ttf|eot|png|jpg|svg)$': '<rootDir>/test/__mocks__/mockExportString.js',
  },
  testMatch: ['<rootDir>/test/**/*.test.{ts,tsx}'],
  passWithNoTests: true,
};
