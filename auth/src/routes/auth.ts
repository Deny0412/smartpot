import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import crypto from 'crypto'
import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/User'
import { ForgotPasswordSchema, LoginSchema, UserSchema } from '../types/auth'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any
  }
}

const auth: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()

  // Register endpoint
  server.post(
    '/auth/register',
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
      try {
        const { email, password, name, surname } = request.body

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
          return reply.code(400).send({ error: 'User already exists' })
        }

        // Create new user
        const hashedPassword = hashPassword(password)
        const user = new UserModel({
          email,
          password: hashedPassword,
          name,
          surname,
        })

        await user.save()
        return { message: 'User registered successfully' }
      } catch (error) {
        
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  // Login endpoint
  server.post(
    '/auth/login',
    {
      schema: {
        body: LoginSchema,
        response: {
          200: Type.Object({
            token: Type.String(),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      try {
        const { email, password } = request.body
        const user = await UserModel.findOne({ email })

        if (!user || user.password !== hashPassword(password)) {
          return reply.code(401).send({ error: 'Invalid credentials' })
        }

        const token = server.jwt.sign(
          {
            user_id: user._id.toString(),
            email: user.email,
          },
          { expiresIn: '24h' }
        )
        return { token }
      } catch (error) {
        
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  // Forgot password endpoint
  server.post(
    '/auth/forgotPassword',
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
      try {
        const { email } = request.body
        const user = await UserModel.findOne({ email })

        if (!user) {
          return reply.code(404).send({ error: 'User not found' })
        }

        // In a real application, send password reset email
        return { message: 'Password reset instructions sent to email' }
      } catch (error) {
        
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )

  // Get user info endpoint (protected route)
  server.get(
    '/auth/get',
    {
      onRequest: [server.authenticate],
      schema: {
        response: {
          200: Type.Object({
            email: Type.String(),
            name: Type.Optional(Type.String()),
            surname: Type.Optional(Type.String()),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      try {
        const user = await UserModel.findOne({ email: request.user.email })
        if (!user) {
          return reply.code(404).send({ error: 'User not found' })
        }

        return {
          email: user.email,
          name: user.name,
          surname: user.surname,
        }
      } catch (error) {
        
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )
  server.get(
    '/auth/exists',
    {
      schema: {
        querystring: Type.Object({
          user_id: Type.String(),
        }),
        response: {
          200: Type.Object({
            exists: Type.Boolean(),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      try {
        const { user_id } = request.query

        if (!user_id) {
          return reply.code(400).send({ error: 'user_id query parameter is required' })
        }

        const user = await UserModel.findById(user_id)
        return {
          exists: !!user,
        }
      } catch (error) {
        
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )
  // Check authorization endpoint
  server.get(
    '/auth/check',
    {
      onRequest: [server.authenticate],
    },
    async (request: any, reply: any) => {
      try {
        const authHeader = request.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.code(400).send({ message: 'Authorization header missing or invalid' })
        }

        const token = authHeader.split(' ')[1]

        // Verify the token using the secret
        const user = server.jwt.verify(token)
        if (!user) {
          return reply.code(401).send({
            message: 'User not authorized',
            authorized: false,
            user: null,
          })
        }

        return {
          message: 'User is authorized',
          authorized: true,
          user: {
            user_id: user.user_id,
            email: user.email,
          },
        }
      } catch (error) {
        
        return reply.code(500).send({ error: 'Internal server error' })
      }
    }
  )
}

export default auth
