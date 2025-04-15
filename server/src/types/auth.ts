import { Type } from '@sinclair/typebox'

export interface JwtPayload {
  email: string
  iat?: number
}

export interface User {
  id: string
  email: string
  password: string
}

export const UserSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 4 }),
})

export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 4 }),
})

export const ForgotPasswordSchema = Type.Object({
  email: Type.String({ format: 'email' }),
})
