import { FastifyInstance } from 'fastify'
import { WebSocketServer } from 'ws'
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
