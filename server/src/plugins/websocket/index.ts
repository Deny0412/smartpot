import { FastifyInstance } from 'fastify'
import { WebSocketServer } from 'ws'
import { handleConnection } from './connection'
import { handleUpgrade } from './upgrade'

export const websocketPlugin = async (fastify: FastifyInstance) => {
  return new Promise<void>((resolve) => {
    const wss = new WebSocketServer({
      noServer: true,
      clientTracking: true,
      perMessageDeflate: false,
    })

    wss.on('connection', handleConnection(fastify))

    fastify.decorate('wss', wss)

    fastify.server.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname

      if (pathname.startsWith('/api/ws/measurements/')) {
        handleUpgrade(request, socket, head, wss)
      } else {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
        socket.destroy()
      }
    })

    fastify.get('/api/ws', (_, reply) => {
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
