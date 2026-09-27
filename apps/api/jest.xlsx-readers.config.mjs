import base from './jest.config.mjs';

export default {
  ...base,
  testRegex: 'src/modules/paqueteria/import/experimental-.*\\.spec\\.ts$',
};
