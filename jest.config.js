require('dotenv').config();

const jestIgnore = process.env.JEST_IGNORE ? process.env.JEST_IGNORE.split(',') : [];

module.exports = {
  setupFiles: ['<rootDir>/tests/setup.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: jestIgnore,
  coveragePathIgnorePatterns: [
    '<rootDir>/tests',
    '<rootDir>/src/utils/db.js',
  ],
};
