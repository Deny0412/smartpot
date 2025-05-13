import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import crypto from 'crypto'
import { FastifyPluginAsync } from 'fastify'
import jwt from 'jsonwebtoken'
import { secrets } from '../config/config'
import { authMiddleware } from '../middleware/auth-middleware'
import { User as UserModel } from '../models/User'
import { ForgotPasswordSchema, LoginSchema, UserSchema } from '../types/auth'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Define schema for the change password request body
const ChangePasswordSchema = Type.Object({
  currentPassword: Type.String(),
  newPassword: Type.String(),
  confirmNewPassword: Type.String(),
})

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
      const { email, password, name, surname } = request.body

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email })
      if (existingUser) {
        return reply.code(400).send({ error: 'User already exists' })
      }

      const hashedPassword = hashPassword(password)

      // Create new user
      await UserModel.create({
        email,
        password: hashedPassword,
        name,
        surname,
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
              name: Type.String(),
              surname: Type.String(),
            }),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const { email, password } = request.body
      const user = await UserModel.findOne({ email })

      if (!user || user.password !== hashPassword(password)) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }

      const token = jwt.sign(
        {
          email: user.email,
          user_id: user._id.toString(),
        },
        secrets.JWT_SECRET
      )
      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || '',
          surname: user.surname || '',
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

      const user = await UserModel.findOne({ email })
      if (!user) {
        return reply.code(404).send({ error: 'User not found' })
      }

      // In a real application, send password reset email
      return { message: 'Password reset instructions sent to email' }
    }
  )

  // Change password endpoint (protected route)
  server.post(
    '/change-password',
    {
      onRequest: authMiddleware, // Ensure user is logged in
      schema: {
        body: ChangePasswordSchema,
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
          400: Type.Object({
            // Bad request (e.g., passwords don't match, missing fields)
            error: Type.String(),
          }),
          401: Type.Object({
            // Unauthorized (e.g., wrong current password)
            error: Type.String(),
          }),
          500: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const { currentPassword, newPassword, confirmNewPassword } = request.body
      const userId = request.user.user_id // Get user ID from authMiddleware

      // Basic validation
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return reply.code(400).send({ error: 'All fields are required.' })
      }

      if (newPassword !== confirmNewPassword) {
        return reply.code(400).send({ error: 'New passwords do not match.' })
      }

      // Optional: Add password complexity requirements here (e.g., length)
      if (newPassword.length < 6) {
        return reply.code(400).send({ error: 'New password must be at least 6 characters long.' })
      }

      try {
        const user = await UserModel.findById(userId)
        if (!user) {
          // This shouldn't happen if authMiddleware works correctly, but check anyway
          return reply.code(404).send({ error: 'User not found' })
        }

        // Verify current password
        const currentPasswordHashed = hashPassword(currentPassword)
        if (user.password !== currentPasswordHashed) {
          return reply.code(401).send({ error: 'Incorrect current password.' })
        }

        // Hash the new password and update the user
        const newPasswordHashed = hashPassword(newPassword)
        user.password = newPasswordHashed
        await user.save()

        return { message: 'Password changed successfully.' }
      } catch (error) {
        console.error('Error changing password:', error)
        return reply.code(500).send({ error: 'An unexpected error occurred while changing password.' })
      }
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
            name: Type.String(),
            surname: Type.String(),
          }),
        },
      },
    },
    async (request: any) => {
      const user = await UserModel.findOne({ email: request.user.email })
      if (!user) {
        throw new Error('User not found')
      }

      return {
        email: user.email,
        name: user.name,
        surname: user.surname,
      }
    }
  )

  // Check token endpoint
  server.get(
    '/check',
    {
      schema: {
        response: {
          200: Type.Object({
            authorized: Type.Boolean(),
            user: Type.Object({
              id: Type.String(),
              email: Type.String(),
              name: Type.String(),
              surname: Type.String(),
            }),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const authHeader = request.headers.authorization
      if (!authHeader) {
        return reply.code(401).send({ error: 'Missing Authorization header' })
      }

      const token = authHeader.split(' ')[1]
      if (!token) {
        return reply.code(401).send({ error: 'Invalid Authorization header format' })
      }

      try {
        const decoded = jwt.verify(token, secrets.JWT_SECRET) as { email: string }
        const user = await UserModel.findOne({ email: decoded.email })

        if (!user) {
          return reply.code(401).send({ error: 'User not found' })
        }

        return {
          authorized: true,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name || '',
            surname: user.surname || '',
          },
        }
      } catch (error) {
        return reply.code(401).send({ error: 'Invalid token' })
      }
    }
  )
}

export default auth
