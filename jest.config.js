module.exports = {
  verbose: true,
  transform: {'\\.ts$': ['ts-jest']},
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageDirectory: '<rootDir>/coverage/',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/tests/data-providers/'
  ]
};
