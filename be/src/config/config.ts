import { config } from 'dotenv';
import { Type } from '@sinclair/typebox';
import { AppConfig } from '../types';

config();

export const ConfigSchema = Type.Object({
  PORT: Type.Number({
    default: 3001,
    minimum: 1,
    maximum: 65535
  }),
  NODE_ENV: Type.Union([
    Type.Literal('development'),
    Type.Literal('production'),
    Type.Literal('test')
  ], { default: 'development' })
});

export const appConfig: AppConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: (process.env.NODE_ENV as AppConfig['NODE_ENV']) || 'development'
}; 