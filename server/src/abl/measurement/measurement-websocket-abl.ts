import { FastifyInstance } from 'fastify'
import { WebSocket } from 'ws'
import { verifyToken } from '../../plugins/auth-middleware'
import { AuthenticatedWebSocket, userConnections } from '../../plugins/websocket/userConnections'
import { measurementService } from './measurement-service'

export async function registerMeasurementWebSocket(fastify: FastifyInstance) {
  if (!fastify.wss) {
    throw new Error('WebSocket server is not initialized')
  }

  fastify.wss.on('connection', async (ws: WebSocket, req) => {
    try {
      // Extract token from URL
      const url = new URL(req.url || '', 'ws://localhost')
      const token = url.searchParams.get('token')
      const flowerId = url.pathname.split('/measurements/')[1]

      if (!token || !flowerId) {
        console.error('Missing token or flower ID:', { token: !!token, flowerId: !!flowerId })
        ws.close(1008, 'Missing token or flower ID')
        return
      }

      // Verify token and get user ID
      const userData = await verifyToken(token)
      if (!userData || !userData.user_id) {
        console.error('Invalid token or missing user_id:', userData)
        ws.close(1008, 'Invalid token')
        return
      }

      const authenticatedWs = ws as AuthenticatedWebSocket
      authenticatedWs.id = Math.random().toString(36).substring(7)
      authenticatedWs.userId = userData.user_id
      authenticatedWs.flowerId = flowerId

      console.log(`WebSocket connected: User ${authenticatedWs.userId} for flower ${authenticatedWs.flowerId}`)
      userConnections.addConnection(authenticatedWs.userId, authenticatedWs.flowerId, authenticatedWs)

      ws.send(
        JSON.stringify({
          type: 'connection',
          message: `Connected to flower ${authenticatedWs.flowerId}`,
        })
      )

      ws.on('message', async (data: string) => {
        try {
          const message = JSON.parse(data)
          console.log(`Message from user ${authenticatedWs.userId} for flower ${authenticatedWs.flowerId}:`, message)

          if (message.type === 'get_measurements') {
            const measurements = await measurementService.getMeasurements(authenticatedWs.flowerId)
            const measurementsWithType = {
              battery: measurements.battery.map((m) => ({ ...m, type: 'battery' })),
              humidity: measurements.humidity.map((m) => ({ ...m, type: 'humidity' })),
              light: measurements.light.map((m) => ({ ...m, type: 'light' })),
              temperature: measurements.temperature.map((m) => ({ ...m, type: 'temperature' })),
              water: measurements.water.map((m) => ({ ...m, type: 'water' })),
            }
            ws.send(
              JSON.stringify({
                type: 'measurements',
                data: measurementsWithType,
              })
            )
          }
        } catch (error) {
          console.error(`Error processing message: ${error}`)
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Error while processing message',
            })
          )
        }
      })

      ws.on('close', () => {
        console.log(`Disconnected: User ${authenticatedWs.userId} from flower ${authenticatedWs.flowerId}`)
        userConnections.removeConnection(authenticatedWs.userId)
      })

      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${authenticatedWs.userId}: ${error}`)
        userConnections.removeConnection(authenticatedWs.userId)
      })
    } catch (error) {
      console.error(`Error in WebSocket connection: ${error}`)
      ws.close(1008, 'Internal server error')
    }
  })
}
