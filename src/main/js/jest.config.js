// src/main/js/jest.config.js
module.exports = {
  projects: [
    {
      displayName: 'dom',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>'],
      testMatch: ['<rootDir>/__tests__/dom/**/*.test.js', 'minify.js'],
      transform: {
        '^.+\\.js$': 'babel-jest'
      }
    },
    {
      displayName: 'node',
      testEnvironment: 'node',
      roots: ['<rootDir>'],
      testMatch: ['<rootDir>/__tests__/**/*.test.js'],
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/dom/', 'minify.js'],
      transform: {
        '^.+\\.js$': 'babel-jest'
      }
    }
  ]
};
