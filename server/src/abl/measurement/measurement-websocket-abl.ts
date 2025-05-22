import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { WebSocket } from 'ws'
import { flowerConnections } from '../../plugins/websocket/floweConnections'
import { measurementService } from './measurement-service'

export async function registerMeasurementWebSocket(fastify: FastifyInstance) {
  if (!fastify.wss) {
    throw new Error('WebSocket server not initialized')
  }

  // Check MongoDB connection
  if (mongoose.connection.readyState !== 1) {
    console.error('[WEBSOCKET] MongoDB is not connected. Current state:', mongoose.connection.readyState)
    return
  }

  console.log('[WEBSOCKET] MongoDB is connected, setting up change streams')

  // Set up change streams for all measurement collections
  const collections = [
    'humiditymeasurements',
    'temperaturemeasurements',
    'lightmeasurements',
    'batterymeasurements',
    'watermeasurements',
  ]

  collections.forEach((collectionName) => {
    try {
      const collection = mongoose.connection.collection(collectionName)

      const changeStream = collection.watch([], {
        fullDocument: 'updateLookup',
        maxAwaitTimeMS: 100,
      })

      changeStream.on('change', async (change: any) => {
        if (change.operationType === 'insert') {
          const measurement = change.fullDocument
          if (!measurement || !measurement.flower_id) {
            return
          }

          const flowerId = measurement.flower_id.toString()
          const measurementType = collectionName.replace('measurements', '')

          // Broadcast only the new measurement
          flowerConnections.broadcastToFlower(flowerId, {
            type: 'measurement_inserted',
            data: {
              ...measurement,
              type: measurementType,
            },
          })
        }
      })

      changeStream.on('error', (error: Error) => {
        setTimeout(() => {
          registerMeasurementWebSocket(fastify)
        }, 5000)
      })

      changeStream.on('close', () => {
        // Attempt to recreate the change stream after close
        setTimeout(() => {
          registerMeasurementWebSocket(fastify)
        }, 5000)
      })
    } catch (error) {
      console.error(`[WEBSOCKET] Error setting up change stream for ${collectionName}:`, error)
    }
  })

  fastify.wss.on('connection', (ws: WebSocket, req) => {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`)
      const token = url.searchParams.get('token')
      const flowerId = url.pathname.split('/').pop()

      if (!token || !flowerId) {
        console.error('[WEBSOCKET] Missing token or flowerId')
        ws.close(4001, 'Unauthorized')
        return
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any
      console.log('[WEBSOCKET] Decoded token:', decoded)

      if (!decoded.user || !decoded.user.id) {
        console.error('[WEBSOCKET] Invalid token structure - missing user.id')
        ws.close(4001, 'Unauthorized')
        return
      }

      const userId = decoded.user.id
      console.log(`[WEBSOCKET] New connection for user ${userId} and flower ${flowerId}`)

      const authenticatedWs = Object.assign(ws, {
        id: Math.random().toString(36).substring(7),
        userId,
        flowerId,
      })

      flowerConnections.addConnection(flowerId, userId, authenticatedWs)

      ws.send(
        JSON.stringify({
          type: 'connection',
          message: `Connected to flower ${flowerId}`,
        })
      )

      ws.on('message', async (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString())
          console.log(`[WEBSOCKET] Message from user ${userId} for flower ${flowerId}:`, data)

          if (data.type === 'get_measurements') {
            console.log(`[WEBSOCKET] Request for measurements for flower ${flowerId}`)
            const measurements = await measurementService.getMeasurements(flowerId)
            ws.send(
              JSON.stringify({
                type: 'measurements',
                data: measurements,
              })
            )
          }
        } catch (error) {
          console.error(`[WEBSOCKET] Error processing message:`, error)
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
            })
          )
        }
      })

      ws.on('close', () => {
        console.log(`[WEBSOCKET] Connection closed for user ${userId} and flower ${flowerId}`)
        flowerConnections.removeConnection(flowerId, userId)
      })

      ws.on('error', (error) => {
        console.error(`[WEBSOCKET] Error for user ${userId} and flower ${flowerId}:`, error)
        flowerConnections.removeConnection(flowerId, userId)
      })
    } catch (error) {
      console.error('[WEBSOCKET] Error processing connection:', error)
      ws.close(4001, 'Unauthorized')
    }
  })

  console.log('[WEBSOCKET] Measurement WebSocket registration completed')
}
