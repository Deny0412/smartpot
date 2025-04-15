import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import crypto from 'crypto'
import { FastifyPluginAsync } from 'fastify'
import jwt from 'jsonwebtoken'
import { appConfig } from '../config/config'
import { authMiddleware } from '../middleware/auth-middleware'
import { ForgotPasswordSchema, LoginSchema, User, UserSchema } from '../types/auth'

// Simulate a simple user database (replace with real database in production)
const users = new Map<string, User>()

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

const auth: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()

  // Register endpoint
  server.post(
    '/register',
    {
      schema: {
        body: UserSchema,
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const { email, password } = request.body

      if (users.has(email)) {
        return reply.code(400).send({ error: 'User already exists' })
      }

      const hashedPassword = hashPassword(password)
      const id = crypto.randomUUID()

      users.set(email, {
        id,
        email,
        password: hashedPassword,
      })

      return { message: 'User registered successfully' }
    }
  )

  // Login endpoint
  server.post(
    '/login',
    {
      schema: {
        body: LoginSchema,
        response: {
          200: Type.Object({
            token: Type.String(),
            user: Type.Object({
              id: Type.String(),
              email: Type.String(),
            }),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const { email, password } = request.body
      const user = users.get(email)

      if (!user || user.password !== hashPassword(password)) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }

      const token = jwt.sign({ email: user.email }, appConfig.JWT_SECRET)
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      }
    }
  )

  // Forgot password endpoint
  server.post(
    '/forgotPassword',
    {
      schema: {
        body: ForgotPasswordSchema,
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const { email } = request.body

      if (!users.has(email)) {
        return reply.code(404).send({ error: 'User not found' })
      }

      // In a real application, send password reset email
      return { message: 'Password reset instructions sent to email' }
    }
  )

  // Get user info endpoint (protected route)
  server.get(
    '/get',
    {
      onRequest: authMiddleware,
      schema: {
        response: {
          200: Type.Object({
            email: Type.String(),
          }),
        },
      },
    },
    async (request: any) => {
      const user = users.get(request.user.email)
      if (!user) {
        throw new Error('User not found')
      }

      return {
        email: user.email,
      }
    }
  )
}

export default auth
