import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { secrets } from '../config/config'
import { User } from '../models/User'

// Extend FastifyRequest to include a user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: {}
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  console.log('Auth middleware called')
  const authHeader = request.headers.authorization
  if (!authHeader) {
    return reply.code(401).send({ error: 'Missing Authorization header' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return reply.code(401).send({ error: 'Invalid Authorization header format' })
  }

  try {
    const decoded = jwt.verify(token, secrets.JWT_SECRET) as { email: string; user_id: string }
    console.log('Decoded token:', decoded)

    if (!decoded.user_id) {
      return reply.code(401).send({ error: 'Unauthorized: User ID missing' })
    }

    const user = await User.findOne({ email: decoded.email })

    if (!user) {
      return reply.code(401).send({ error: 'User not found' })
    }

    request.user = {
      id: user._id.toString(),
      user_id: decoded.user_id,
      email: user.email,
      name: user.name || '',
      surname: user.surname || '',
    }
  } catch (error) {
    console.error('Error in auth middleware:', error)
    return reply.code(401).send({ error: 'Invalid token' })
  }
}
