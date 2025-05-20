import { Type } from '@sinclair/typebox'
import { FastifyPluginAsync } from 'fastify'
import authRoutes from './auth' // Import the auth routes
import flowerRoutes from './flower' // Import the flower routes
import flowerProfileRoutes from './flowerProfile' // Import the household routes
import householdRoutes from './household' // Import the household routes
import measurementRoutes from './measurement'
import scheduleRoutes from './schedule'
import smartpotRoutes from './smart-pot' // Import the smartpot routes
import userRoutes from './user'
const routes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint
  fastify.get(
    '/health',
    {
      schema: {
        response: {
          200: Type.Object({
            status: Type.String(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      }
    }
  )

 
  fastify.register(flowerRoutes, { prefix: '/flower' })
  fastify.register(householdRoutes, { prefix: '/household' })
  fastify.register(smartpotRoutes, { prefix: '/smart-pot' })
  fastify.register(scheduleRoutes, { prefix: '/schedule' })
  fastify.register(userRoutes, { prefix: '/user' })

  fastify.register(flowerProfileRoutes, { prefix: '/flowerProfile' })
  fastify.register(authRoutes, { prefix: '/auth' })
  fastify.register(measurementRoutes, { prefix: '/measurements' })
}

export default routes
