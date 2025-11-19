/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  roots: ['<rootDir>'],
  transform: {
    '^.+\.ts?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'nodenext',
        moduleResolution: 'nodenext'
      }
    }],
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
  moduleNameMapper: {
    '^@poap-xyz/poap-sdk$': '<rootDir>/src',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
