import { FastifyInstance } from 'fastify'
import { userController } from '../controller/user-controller'
import { authMiddleware } from '../middleware/auth-middleware'

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/search',
    {
      onRequest: [authMiddleware],
    },
    userController.search
  )

  fastify.get(
    '/invites',
    {
      onRequest: [authMiddleware],
    },
    userController.getInvites
  )
}
