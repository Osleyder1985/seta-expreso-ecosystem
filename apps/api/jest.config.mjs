export default {
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '(test/.*\\.e2e-spec|src/.*\\.spec)\\.ts$',
  transformIgnorePatterns: [
    'node_modules/(?!(@nestjs|rxjs|reflect-metadata)/)',
  ],
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest', {
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        target: 'es2023',
        transform: { legacyDecorator: true, decoratorMetadata: true }
      },
      module: { type: 'es6' }
    }]
  },
  testEnvironment: 'node',
};
