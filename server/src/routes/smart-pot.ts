import { Type } from '@sinclair/typebox'
import { FastifyPluginAsync } from 'fastify'
import { smartpotController } from '../controller/smart-pot-controller'
import { authMiddleware } from '../middleware/auth-middleware'
import { householdAuthMidlleware } from '../middleware/household-membership-middleware'

const MEMBER_ROLE = 'member'
const OWNER_ROLE = 'owner'

const smartPotRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/create',
    {
      onRequest: [authMiddleware],
    },
    smartpotController.create
  )
  fastify.get(
    '/get/:id',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])],
    },
    smartpotController.get
  )
  fastify.put(
    '/update',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])],
    },
    smartpotController.update
  )
  fastify.put(
    '/disconnect',
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    smartpotController.disconnect
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

  fastify.post(
    '/transplant-with-flower',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE])],
      schema: {
        body: Type.Object({
          smartPotId: Type.String(),
          targetHouseholdId: Type.String(),
        }),
      },
    },
    smartpotController.transplantWithFlower
  )

  fastify.post(
    '/transplant-without-flower',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE])],
      schema: {
        body: Type.Object({
          smartPotId: Type.String(),
          targetHouseholdId: Type.String(),
          assignOldFlower: Type.Boolean(),
          newSmartPotId: Type.Optional(Type.String()),
        }),
      },
    },
    smartpotController.transplantWithoutFlower
  )

  fastify.post(
    '/transplant-to-flower',
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])],
      schema: {
        body: Type.Object({
          smartPotId: Type.String(),
          targetFlowerId: Type.String(),
        }),
      },
    },
    smartpotController.transplantToFlower
  )
}

export default smartPotRoutes
