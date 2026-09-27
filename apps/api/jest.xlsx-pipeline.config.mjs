export default {
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': ['@swc/jest'] },
  testMatch: ['**/f10-f19-pipeline-certification.spec.ts'],
  moduleFileExtensions: ['js', 'ts'],
};
