import { FastifyInstance } from 'fastify'
import { measurementService } from '../../abl/measurement/measurement-service'
import { AuthenticatedWebSocket, flowerConnections } from './floweConnections'

export function handleConnection(fastify: FastifyInstance) {
  return (ws: AuthenticatedWebSocket) => {
    if (!ws.userId || !ws.flowerId) {
      console.error('[WEBSOCKET] Missing userId or flowerId in WebSocket connection')
      ws.close(4001, 'Unauthorized')
      return
    }

    fastify.log.info(`[WEBSOCKET] WebSocket connected: User ${ws.userId} for flower ${ws.flowerId}`)
    flowerConnections.addConnection(ws.flowerId, ws.userId, ws)

    // Send initial connection confirmation
    ws.send(
      JSON.stringify({
        type: 'connection',
        message: `Connected to flower ${ws.flowerId}`,
      })
    )

    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString())
        fastify.log.info(`[WEBSOCKET] Message from user ${ws.userId} for flower ${ws.flowerId}:`, data)

        if (data.type === 'get_measurements') {
          fastify.log.info(`[WEBSOCKET] Request for measurements for flower ${ws.flowerId}`)
          const measurements = await measurementService.getMeasurements(ws.flowerId)
          ws.send(
            JSON.stringify({
              type: 'measurements',
              data: measurements,
            })
          )
        }
      } catch (error) {
        fastify.log.error(`[WEBSOCKET] Error parsing message: ${error}`)
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
          })
        )
      }
    })

    ws.on('close', () => {
      fastify.log.info(`[WEBSOCKET] Disconnected: User ${ws.userId} from flower ${ws.flowerId}`)
      flowerConnections.removeConnection(ws.flowerId, ws.userId)
    })

    ws.on('error', (error: Error) => {
      fastify.log.error(`[WEBSOCKET] WebSocket error for user ${ws.userId}: ${error}`)
      flowerConnections.removeConnection(ws.flowerId, ws.userId)
    })
  }
}
