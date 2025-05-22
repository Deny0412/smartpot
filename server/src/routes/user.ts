import { FastifyInstance } from 'fastify'
import { userController } from '../controller/user-controller'

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/search', userController.search)
  fastify.get('/invites', userController.getInvites)
}
