import { FastifyInstance } from 'fastify'
import { Types } from 'mongoose'
import { WebSocket } from 'ws'
import HumidityModel from '../../models/HumidityMeasurement'
import LightModel from '../../models/LightMeasurement'
import TemperatureModel from '../../models/TemperatureMeasurement'
import WaterModel from '../../models/WaterMeasurement'
import BatteryModel from '../../models/BatteryMeasurement'
// Mapovanie typov meraní na modely
const measurementModels = {
  humidity: HumidityModel,
  temperature: TemperatureModel,
  light: LightModel,
  water: WaterModel,
  battery: BatteryModel,
} as const

type MeasurementType = keyof typeof measurementModels

// Mapa pre ukladanie WebSocket pripojení
const connections = new Map<string, Set<WebSocket>>()

// Funkcia pre sledovanie zmien v databáze
async function watchDatabaseChanges() {
  console.log('Inicializujem Change Streams...')

  for (const [type, model] of Object.entries(measurementModels)) {
    console.log(`Nastavujem Change Stream pre ${type}...`)

    try {
      const changeStream = (model as any).watch([], {
        fullDocument: 'updateLookup',
      })

      changeStream.on('change', (change: any) => {
        console.log(`Zmena v kolekcii ${type}:`, {
          operationType: change.operationType,
          documentId: change.documentKey?._id,
          fullDocument: change.fullDocument,
          timestamp: new Date().toISOString(),
        })

        const flowerId = change.fullDocument?.flower_id?.toString()
        if (!flowerId) {
          console.log('Chýba flower_id v dokumente')
          return
        }

        const connectionsForFlower = connections.get(flowerId)
        if (!connectionsForFlower) {
          console.log(`Žiadne pripojenia pre flowerId: ${flowerId}`)
          return
        }

        const message = {
          type,
          operation: change.operationType,
          data: change.fullDocument,
        }

        console.log('Posielam správu klientom:', {
          flowerId,
          message,
          connectionsCount: connectionsForFlower.size,
          timestamp: new Date().toISOString(),
        })

        // Poslanie správy všetkým pripojeným klientom pre daný flowerId
        connectionsForFlower.forEach((socket) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message))
          }
        })
      })

      changeStream.on('error', (error: any) => {
        console.error(`Chyba v Change Stream pre ${type}:`, error)
      })

      console.log(`Change Stream pre ${type} úspešne inicializovaný`)
    } catch (error) {
      console.error(`Chyba pri inicializácii Change Stream pre ${type}:`, error)
    }
  }
}

// Funkcia pre spracovanie WebSocket pripojení
export async function registerMeasurementWebSocket(fastify: FastifyInstance) {
  // Spustenie sledovania zmien v databáze
  watchDatabaseChanges()

  fastify.get<{ Params: { flowerId: string } }>(
    '/ws/measurements/:flowerId',
    { websocket: true },
    (connection, req) => {
      const flowerId = req.params.flowerId

      if (!Types.ObjectId.isValid(flowerId)) {
        connection.socket.close(1008, 'Invalid flower ID')
        return
      }

      // Pridanie pripojenia do mapy
      if (!connections.has(flowerId)) {
        connections.set(flowerId, new Set())
      }
      connections.get(flowerId)?.add(connection.socket)
      console.log(
        `Pridané nové pripojenie pre flowerId: ${flowerId}, celkový počet pripojení: ${connections.get(flowerId)?.size}`
      )

      // Spracovanie správ od klienta
      connection.socket.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString())
         

          // Spracovanie heartbeat správy
          if (data.type === 'heartbeat') {
            connection.socket.send(JSON.stringify({ type: 'heartbeat' }))
            return
          }

          // Spracovanie init správy
          if (data.type === 'init') {
            connection.socket.send(
              JSON.stringify({
                type: 'init',
                status: 'success',
                data: {
                  flowerId,
                  timestamp: new Date().toISOString(),
                },
              })
            )
            return
          }

          // Spracovanie ostatných správ
          if (data.type && data.operation && data.data) {
            const model = measurementModels[data.type as MeasurementType]
            if (!model) {
              console.warn('Neznámy typ merania:', {
                type: data.type,
                flowerId,
                timestamp: new Date().toISOString(),
              })
              return
            }

            switch (data.operation) {
              case 'insert': {
                const newMeasurement = await (model as any).create({
                  flower_id: new Types.ObjectId(flowerId),
                  value: data.data.value,
                })
                connection.socket.send(
                  JSON.stringify({
                    type: data.type,
                    operation: 'insert',
                    data: newMeasurement,
                  })
                )
                break
              }

              case 'update': {
                if (data.data._id) {
                  const updatedMeasurement = await (model as any).findByIdAndUpdate(
                    data.data._id,
                    { value: data.data.value },
                    { new: true }
                  )
                  if (updatedMeasurement) {
                    connection.socket.send(
                      JSON.stringify({
                        type: data.type,
                        operation: 'update',
                        data: updatedMeasurement,
                      })
                    )
                  }
                }
                break
              }

              case 'delete': {
                if (data.data._id) {
                  await (model as any).findByIdAndDelete(data.data._id)
                  connection.socket.send(
                    JSON.stringify({
                      type: data.type,
                      operation: 'delete',
                      data: { _id: data.data._id },
                    })
                  )
                }
                break
              }
            }
          } else {
            console.warn('Správa bez dát:', {
              flowerId,
              message: data,
              timestamp: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error('Chyba pri spracovaní WebSocket správy:', {
            error,
            flowerId,
            timestamp: new Date().toISOString(),
          })
        }
      })

      // Spracovanie zatvorenia pripojenia
      connection.socket.on('close', () => {
      console.log('WebSocket pripojenie zatvorené pre flowerId:', flowerId)
        // Odstránenie pripojenia z mapy
        connections.get(flowerId)?.delete(connection.socket)
        if (connections.get(flowerId)?.size === 0) {
          connections.delete(flowerId)
        }
        console.log(
          `Odstránené pripojenie pre flowerId: ${flowerId}, zostávajúce pripojenia: ${
            connections.get(flowerId)?.size || 0
          }`
        )
      })

      // Spracovanie chýb
      connection.socket.on('error', (error) => {
        console.error('WebSocket chyba pre flowerId:', {
          error,
          flowerId,
          timestamp: new Date().toISOString(),
        })
      })
    }
  )
}
