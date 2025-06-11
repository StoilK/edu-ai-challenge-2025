export default {
  testEnvironment: 'node',
  
  // Module resolution for ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Test patterns  
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/seabattle.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60, 
      lines: 60,
      statements: 60
    }
  },
  
  // Enable verbose output
  verbose: true
}; 