import { Type } from '@sinclair/typebox'
import { config } from 'dotenv'

config()

export interface AppConfig {
  PORT: number
  NODE_ENV: 'development' | 'production' | 'test'
  MONGODB_URI: string
  JWT_SECRET: string
}

export const ConfigSchema = Type.Object({
  PORT: Type.Number({
    default: 3001,
    minimum: 1,
    maximum: 65535,
  }),
  NODE_ENV: Type.Union([Type.Literal('development'), Type.Literal('production'), Type.Literal('test')], {
    default: 'development',
  }),
  MONGODB_URI: Type.String(),
  JWT_SECRET: Type.String(),
})

export const appConfig: AppConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: (process.env.NODE_ENV as AppConfig['NODE_ENV']) || 'development',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb+srv://skull-crusher123:275Y34NbzVky4QrN@clustermain.zgzesyz.mongodb.net/smart-pot',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
}
