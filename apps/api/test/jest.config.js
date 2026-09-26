module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};: ['@swc/jest', { jsc: { parser: { syntax: 'typescript', decorators: true }, target: 'es2023', transform: { legacyDecorator: true, decoratorMetadata: true } }, module: { type: 'commonjs' } }] },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};