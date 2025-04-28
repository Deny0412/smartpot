import { flowerController } from '../controller/flower-controller'

import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth-middleware'
import { householdAuthMidlleware } from '../middleware/household-membership-middleware'

const MEMBER_ROLE = 'member'
const OWNER_ROLE = 'owner'

export default async function flowerRoutes(fastify: FastifyInstance) {
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
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
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
  //fastify.get('/flower/history/humidity', /* handler for humidity history */);
  //fastify.get('/flower/history/temperature', /* handler for temperature history */);
  //fastify.get('/flower/history/waterlevel', /* handler for water level history */);
}
