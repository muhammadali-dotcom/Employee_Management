import type { Config } from 'jest';
import path from 'path';

const rootDir = process.cwd();

const config: Config = {
  rootDir,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.tsx', '**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: path.join(rootDir, 'babel.jest.config.js') }],
  },
};

export default config;
