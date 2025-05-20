import { FastifyReply, FastifyRequest } from 'fastify'
import fetch from 'node-fetch'
declare module 'fastify' {
  interface FastifyRequest {
    user?: {}
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  

  const authHeader = request.headers.authorization
 

  if (!authHeader) {
    return reply.code(401).send({ error: 'Missing Authorization header' })
  }

  // Check for correct Bearer format
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    console.log('Error: Invalid authorization format - should start with "Bearer "')
    return reply.code(401).send({ error: 'Invalid authorization format' })
  }

  const token = authHeader.split(' ')[1]
  

  if (!token) {
    
    return reply.code(401).send({ error: 'Invalid Authorization header format' })
  }

  try {
    const authServerUrl = process.env.AUTH_SERVER_URL || 'http://localhost:3003'
    

    if (!authServerUrl) {
      
      throw new Error('AUTH_SERVER_URL environment variable is not set')
    }

    console.log('Sending request to auth server...')
    const response = await fetch(`${authServerUrl}/auth/check`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    

    if (!response.ok) {
      const errorData = await response.json()
      
      return reply.code(401).send({ error: 'Unauthorized', details: errorData })
    }

    const data = await response.json()
    

    if (!data.authorized) {
      console.log('Error: User not authorized')
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    request.user = { id: data.user.user_id }
    
  } catch (error) {
  
    return reply.code(500).send({ error: 'Internal Server Error' })
  }
}
