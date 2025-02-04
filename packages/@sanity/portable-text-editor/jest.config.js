const baseConfig = require('../../../jest.config.base')

module.exports = {
  ...baseConfig,
  displayName: require('./package.json').name,
  globalSetup: '<rootDir>/test/setup/globalSetup.ts',
  globalTeardown: '<rootDir>/test/setup/globalTeardown.ts',
  setupFilesAfterEnv: ['<rootDir>/test/setup/afterEnv.ts'],
}
