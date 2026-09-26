module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
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
  transformIgnorePatterns: ['/node_modules/(?!@nestjs/)'],
  testEnvironment: 'node',
};