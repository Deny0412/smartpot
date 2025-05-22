import { FastifyInstance } from 'fastify'
import mongoose from 'mongoose'
import { WebSocketServer } from 'ws'
import { registerMeasurementWebSocket } from '../../abl/measurement/measurement-websocket-abl'
import { handleConnection } from './connection'
import { handleUpgrade } from './upgrade'

export const websocketPlugin = async (fastify: FastifyInstance) => {
  return new Promise<void>((resolve) => {
    const wss = new WebSocketServer({ noServer: true })

    wss.on('connection', handleConnection(fastify))

    fastify.decorate('wss', wss)

    fastify.server.on('upgrade', (request, socket, head) => {
      handleUpgrade(request, socket, head, wss)
    })

    fastify.get('/ws', (_, reply) => {
      reply.send({
        message: 'WebSocket server is running and requires token authentication',
      })
    })

    // Register measurement WebSocket after MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      console.log('[WEBSOCKET] MongoDB is connected, registering measurement WebSocket')
      registerMeasurementWebSocket(fastify)
    } else {
      console.log('[WEBSOCKET] Waiting for MongoDB connection...')
      mongoose.connection.once('connected', () => {
        console.log('[WEBSOCKET] MongoDB connected, registering measurement WebSocket')
        registerMeasurementWebSocket(fastify)
      })
    }

    setImmediate(() => {
      resolve()
    })
  })
}

declare module 'fastify' {
  interface FastifyInstance {
    wss: WebSocketServer
  }
}
