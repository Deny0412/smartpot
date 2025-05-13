import cors from '@fastify/cors'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Fastify from 'fastify'
import { appConfig } from './config/config'
//import { swaggerPlugin } from "./plugins/swagger";
import mongoose from 'mongoose'
import { dbPlugin } from './config/database'
import routes from './routes' // Import your API routes
//import { websocketPlugin } from "./server-socket"; // Import the WebSocket plugin
import { measurementService } from './abl/measurement/measurement-service'
import { websocketPlugin } from './plugins/websocket/index' // Import the WebSocket plugin

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>()

// Register plugins
fastify.register(cors, {
  origin: true, // allow all origins for now
})

fastify.register(dbPlugin)
//fastify.register(swaggerPlugin);
fastify.register(routes, { prefix: '/api' })
fastify.register(websocketPlugin) // Register the WebSocket plugin

// Inicializácia measurement service
measurementService.setFastify(fastify)

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: appConfig.PORT,
      host: '0.0.0.0',
    })
    fastify.log.info(`Server is running on port ${appConfig.PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close()
    console.log('MongoDB connection closed')
    process.exit(0)
  } catch (err) {
    console.error('Error during graceful shutdown:', err)
    process.exit(1)
  }
})

start()
