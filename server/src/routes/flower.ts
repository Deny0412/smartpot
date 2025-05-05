import { Type } from '@sinclair/typebox'
import { FastifyPluginAsync } from 'fastify'
import { flowerDisconnectAbl } from '../abl/flower/flower-disconnect-abl'
import { flowerController } from '../controller/flower-controller'
import { authMiddleware } from '../middleware/auth-middleware'
import { householdAuthMidlleware } from '../middleware/household-membership-middleware'

const MEMBER_ROLE = 'member'
const OWNER_ROLE = 'owner'

const flowerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/add',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    flowerController.create
  )

  fastify.delete(
    '/delete/:id',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    flowerController.delete
  )
  fastify.get(
    '/get/:id',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    flowerController.get
  )
  fastify.get(
    '/list',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    flowerController.list
  )
  fastify.put(
    '/update',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    flowerController.update
  )

  fastify.get(
    '/listactive',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    flowerController.listActive
  )
  fastify.get(
    '/schedule/:id',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    flowerController.getSchedule
  )
  fastify.put(
    '/schedule/:id',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    flowerController.updateSchedule
  )

  fastify.post(
    '/export',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE])],
    },
    flowerController.export
  )

  // Disconnect flower from smartpot
  fastify.post(
    '/disconnect',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE])],
      schema: {
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            message: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      await flowerDisconnectAbl(request.body, reply)
    }
  )

  // Transplant flower with smartpot to another household
  fastify.post(
    '/transplant-with-smartpot',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])],
      schema: {
        body: Type.Object({
          flowerId: Type.String(),
          targetHouseholdId: Type.String(),
        }),
      },
    },
    flowerController.transplantWithSmartPot
  )

  // Transplant flower without smartpot to another household
  fastify.post(
    '/transplant-without-smartpot',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])],
      schema: {
        body: Type.Object({
          flowerId: Type.String(),
          targetHouseholdId: Type.String(),
          assignOldSmartPot: Type.Boolean(),
          newFlowerId: Type.Optional(Type.String()),
        }),
      },
    },
    flowerController.transplantWithoutSmartPot
  )

  // Transplant flower to another smartpot in same household
  fastify.post(
    '/transplant-to-smartpot',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])],
      schema: {
        body: Type.Object({
          flowerId: Type.String(),
          targetSmartPotId: Type.String(),
        }),
      },
    },
    flowerController.transplantToSmartPot
  )
}

export default flowerRoutes
