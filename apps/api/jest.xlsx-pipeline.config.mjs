export default {
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': ['@swc/jest'] },
  testMatch: ['**/f10-f19-pipeline-certification.spec.ts', '**/reader-to-pipeline-f10-f20.spec.ts'],
  moduleFileExtensions: ['js', 'ts'],
};
