import { FastifyInstance } from 'fastify'
import { smartpotController } from '../controller/smart-pot-controller'
import { authMiddleware } from '../middleware/auth-middleware'
import { householdAuthMidlleware } from '../middleware/household-membership-middleware'

const MEMBER_ROLE = 'member'
const OWNER_ROLE = 'owner'

export default async function smartpotRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/create',
    {
      onRequest: [authMiddleware], // Administrator při výrobě
    },
    smartpotController.create
  )
  fastify.get(
    '/get/:id',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    smartpotController.get
  )
  fastify.put(
    '/update',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    smartpotController.update
  )
  fastify.get(
    '/empty',
    {
      onRequest: [authMiddleware],
    },
    smartpotController.empty
  ),
  fastify.get(
    '/household/:id',
    {
      onRequest: [authMiddleware],
    },
    smartpotController.getByHousehold
  )
}
