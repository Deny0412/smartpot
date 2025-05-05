import { FastifyPluginAsync } from 'fastify'
import mongoose from 'mongoose'
import { appConfig } from './config'

export const dbPlugin: FastifyPluginAsync = async (fastify) => {
  try {
    await mongoose.connect(appConfig.MONGODB_URI)

    fastify.log.info('MongoDB connected successfully')

    // Close MongoDB connection when fastify closes
    fastify.addHook('onClose', async () => {
      await mongoose.connection.close()
      fastify.log.info('MongoDB connection closed')
    })
  } catch (err) {
    fastify.log.error('MongoDB connection error:', err)
    throw err
  }
}
