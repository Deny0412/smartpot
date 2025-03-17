import { config } from 'dotenv';
import { Type } from '@sinclair/typebox';

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

export type Config = typeof ConfigSchema;

export const appConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development'
} as const; 