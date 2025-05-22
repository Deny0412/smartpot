import { FastifyReply, FastifyRequest } from 'fastify'
import getInvitesHandler from '../abl/user/user-get-invites-abl'
import searchUsersHandler from '../abl/user/user-search-abl'
import { sendError } from '../middleware/response-handler'

export const userController = {
  search: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { query } = request.query as { query: string }
      await searchUsersHandler(query, reply)
    } catch (error) {
      console.error('Error in user search controller:', error)
      sendError(reply, error)
    }
  },

  getInvites: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id
      console.log('User controller - getInvites - userId:', userId)

      if (!userId) {
        console.error('User controller - getInvites - Missing userId in request')
        return reply.status(400).send({ error: 'Missing user ID' })
      }

      await getInvitesHandler(userId, reply)
    } catch (error) {
      console.error('Error in user getInvites controller:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },
}
