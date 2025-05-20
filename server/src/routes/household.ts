import { FastifyInstance } from 'fastify'
import { householdController } from '../controller/household-controller'
import { authMiddleware } from '../middleware/auth-middleware'
import { householdAuthMidlleware } from '../middleware/household-membership-middleware'

const MEMBER_ROLE = 'member'
const OWNER_ROLE = 'owner'

export default async function householdRoutes(fastify: FastifyInstance) {
  fastify.post('/create', { onRequest: authMiddleware }, householdController.create)
  fastify.delete(
    '/delete',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE])],
    },
    householdController.delete
  )
  fastify.get(
    '/get/:id',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])],
    },
    householdController.get
  )
  fastify.get(
    '/members/:id',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])],
    },
    householdController.getMembers
  )
  fastify.put(
    '/update',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE])],
    },
    householdController.update
  )
  fastify.get(
    '/list',
    {
      onRequest: [authMiddleware], // Then check household auth
    },
    householdController.list
  )
  fastify.post(
    '/invite',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    householdController.invite
  )
  fastify.put(
    '/kick',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    householdController.kick
  )
  fastify.put(
    '/changeOwner',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    householdController.changeOwner
  )
  fastify.put(
    '/decision',
    {
      onRequest: [authMiddleware], // Authenticate first
    },
    householdController.decision
  )
  fastify.put(
    '/leave',
    {
      onRequest: [authMiddleware], // Authenticate first
    },
    householdController.leave
  )
}
