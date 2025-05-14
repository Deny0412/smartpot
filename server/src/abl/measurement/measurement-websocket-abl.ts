import { FastifyInstance } from 'fastify'
import { WebSocket } from 'ws'
import { AuthenticatedWebSocket, userConnections } from '../../plugins/websocket/userConnections'
import { measurementService } from './measurement-service'

export async function registerMeasurementWebSocket(fastify: FastifyInstance) {
  if (!fastify.wss) {
    throw new Error('WebSocket server is not initialized')
  }

  fastify.wss.on('connection', (ws: WebSocket, req) => {
    const userId = req.headers['user-id'] as string
    const flowerId = req.headers['flower-id'] as string

    if (!userId || !flowerId) {
      ws.close(1008, 'Missing user ID or flower ID')
      return
    }

    const authenticatedWs = ws as AuthenticatedWebSocket
    authenticatedWs.id = Math.random().toString(36).substring(7)
    authenticatedWs.userId = userId
    authenticatedWs.flowerId = flowerId

    
    userConnections.addConnection(userId, flowerId, authenticatedWs)

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data)
        

        if (message.type === 'get_measurements') {
          const measurements = await measurementService.getMeasurements(flowerId)
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
        
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Error while processing message',
          })
        )
      }
    })

    ws.on('close', () => {
    
      userConnections.removeConnection(userId)
    })

    ws.on('error', (error) => {
  
      userConnections.removeConnection(userId)
    })
  })
}
