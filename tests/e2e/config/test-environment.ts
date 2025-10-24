/**
 * Test environment configuration
 * Manages different testing environments and their settings
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  baseURL: string;
  apiTimeout: number;
  pageTimeout: number;
  mockAPI: boolean;
  enableTracing: boolean;
  enableVideo: boolean;
  retries: number;
}

export const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    baseURL: 'http://localhost:3009',
    apiTimeout: 10000,
    pageTimeout: 30000,
    mockAPI: true,
    enableTracing: true,
    enableVideo: true,
    retries: 0,
  },
  staging: {
    baseURL: 'https://staging.arachat.io',
    apiTimeout: 15000,
    pageTimeout: 45000,
    mockAPI: false,
    enableTracing: true,
    enableVideo: true,
    retries: 1,
  },
  production: {
    baseURL: 'https://arachat.io',
    apiTimeout: 20000,
    pageTimeout: 60000,
    mockAPI: false,
    enableTracing: false,
    enableVideo: false,
    retries: 2,
  },
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = (process.env.TEST_ENV as Environment) || 'development';
  return environments[env];
}

export function getCurrentEnvironment(): Environment {
  return (process.env.TEST_ENV as Environment) || 'development';
}