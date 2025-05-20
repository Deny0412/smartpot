import { FastifyInstance } from 'fastify'
import { measurementService } from '../../abl/measurement/measurement-service'
import { AuthenticatedWebSocket, userConnections } from './userConnections'

export function handleConnection(fastify: FastifyInstance) {
  return (ws: AuthenticatedWebSocket) => {
    if (!ws.userId || !ws.flowerId) {
      ws.close(4001, 'Unauthorized')
      return
    }

    fastify.log.info(`WebSocket connected: User ${ws.userId} for flower ${ws.flowerId}`)
    userConnections.addConnection(ws.userId, ws.flowerId, ws)

    ws.send(
      JSON.stringify({
        type: 'connection',
        message: `Connected to flower ${ws.flowerId}`,
      })
    )

    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString())
        fastify.log.info(`Message from user ${ws.userId} for flower ${ws.flowerId}:`, data)

        if (data.type === 'get_measurements') {
          fastify.log.info(`Žiadosť o merania pre kvetinu ${ws.flowerId}`)
          const measurements = await measurementService.getMeasurements(ws.flowerId)
          ws.send(
            JSON.stringify({
              type: 'measurements',
              data: measurements,
            })
          )
        }
      } catch (error) {
        fastify.log.error(`Error parsing message: ${error}`)
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
          })
        )
      }
    })

    ws.on('close', () => {
      fastify.log.info(`Disconnected: User ${ws.userId} from flower ${ws.flowerId}`)
      userConnections.removeConnection(ws.userId)
    })

    ws.on('error', (error: Error) => {
      fastify.log.error(`WebSocket error for user ${ws.userId}: ${error}`)
      userConnections.removeConnection(ws.userId)
    })
  }
}
