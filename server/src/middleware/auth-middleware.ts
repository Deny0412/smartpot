import { FastifyRequest, FastifyReply } from 'fastify';

// Extend FastifyRequest to include a user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: { email: string };
  }
}
import fetch from 'node-fetch';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return reply.code(401).send({ error: 'Missing Authorization header' });
  }

  // Extract token (assumes format: "Bearer <token>")
  const token = authHeader.split(' ')[1];
  if (!token) {
    return reply.code(401).send({ error: 'Invalid Authorization header format' });
  }

  try {
    const authServerUrl = process.env.AUTH_SERVER_URL; // Use an environment variable for the auth server URL
    if (!authServerUrl) {
      throw new Error('AUTH_SERVER_URL environment variable is not set');
    }

    const response = await fetch(`${authServerUrl}/auth/check`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const data = await response.json() as { authorized: boolean; email: string };

    if (data.authorized) {
      // Optionally attach user information to the request
      request.user = { email: data.email };
      return;
    } else {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}