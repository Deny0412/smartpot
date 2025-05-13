import { FastifyInstance } from 'fastify'
import { Types } from 'mongoose'
import BatteryMeasurement from '../../models/BatteryMeasurement'
import HumidityMeasurement from '../../models/HumidityMeasurement'
import LightMeasurement from '../../models/LightMeasurement'
import TemperatureMeasurement from '../../models/TemperatureMeasurement'
import WaterMeasurement from '../../models/WaterMeasurement'
import { userConnections } from '../../plugins/websocket/userConnections'

type MeasurementType = 'battery' | 'humidity' | 'light' | 'temperature' | 'water'

interface MeasurementData {
  type: MeasurementType
  flower_id: string
  value: number
  _id?: string
}

export async function broadcastMeasurement(flowerId: string, measurement: any, type: MeasurementType) {
  

  const message = JSON.stringify({
    type: 'measurement_inserted',
    data: {
      ...measurement,
      type,
    },
  })

  userConnections.broadcastToFlower(flowerId, message)
}

class MeasurementService {
  private measurementModels = {
    battery: BatteryMeasurement,
    humidity: HumidityMeasurement,
    light: LightMeasurement,
    temperature: TemperatureMeasurement,
    water: WaterMeasurement,
  } as const

  private fastify: FastifyInstance | null = null
  private changeStreams: any[] = []

  setFastify(fastify: FastifyInstance) {
    this.fastify = fastify
    this.initializeChangeStreams()
  }

  private initializeChangeStreams() {
    
    Object.entries(this.measurementModels).forEach(([type, Model]) => {
      const changeStream = Model.watch([], { fullDocument: 'updateLookup' })

      changeStream.on('change', (change) => {
       

        if (change.operationType === 'insert' && change.fullDocument) {
          const flowerId = change.fullDocument.flower_id.toString()
     
          this.broadcastToFlower(flowerId, {
            type: 'measurement_inserted',
            data: {
              ...change.fullDocument,
              type: type,
            },
          })
        } else if (change.operationType === 'update' && change.fullDocument) {
          const flowerId = change.fullDocument.flower_id.toString()
         
          this.broadcastToFlower(flowerId, {
            type: 'measurement_updated',
            data: {
              ...change.fullDocument,
              type: type,
            },
          })
        } else if (change.operationType === 'delete' && change.documentKey) {
          const flowerId = change.documentKey._id.toString()
          console.log('Broadcasting delete to flower:', flowerId)
          this.broadcastToFlower(flowerId, {
            type: 'measurement_deleted',
            data: {
              _id: change.documentKey._id,
              type: type as MeasurementType,
            },
          })
        }
      })

      this.changeStreams.push(changeStream)
    })
  }

  private broadcastToFlower(flowerId: string, message: any) {
    try {
     

      
      const messageWithType = {
        ...message,
        data: {
          ...message.data,
          type: message.data.type || 'humidity', 
        },
      }

      
      userConnections.broadcastToFlower(flowerId, messageWithType)
    } catch (error) {
      console.error('Error while broadcasting to flower', error)
    }
  }

  async getMeasurements(flowerId: string) {
    try {
      const measurements = await Promise.all([
        BatteryMeasurement.find({ flower_id: new Types.ObjectId(flowerId) })
          .sort({ createdAt: -1 })
          .limit(1000),
        HumidityMeasurement.find({ flower_id: new Types.ObjectId(flowerId) })
          .sort({ createdAt: -1 })
          .limit(1000),
        LightMeasurement.find({ flower_id: new Types.ObjectId(flowerId) })
          .sort({ createdAt: -1 })
          .limit(1000),
        TemperatureMeasurement.find({ flower_id: new Types.ObjectId(flowerId) })
          .sort({ createdAt: -1 })
          .limit(1000),
        WaterMeasurement.find({ flower_id: new Types.ObjectId(flowerId) })
          .sort({ createdAt: -1 })
          .limit(1000),
      ])

      return {
        battery: measurements[0],
        humidity: measurements[1],
        light: measurements[2],
        temperature: measurements[3],
        water: measurements[4],
      }
    } catch (error) {
      throw error
    }
  }

  async insertMeasurement(data: MeasurementData) {
    try {
      const Model = this.measurementModels[data.type]
      if (!Model) {
        throw new Error(`Unknown measurement type: ${data.type}`)
      }

      const measurement = new Model({
        flower_id: new Types.ObjectId(data.flower_id),
        value: data.value,
        type: data.type,
      })

      await measurement.save()

    

     
      this.broadcastToFlower(data.flower_id, {
        type: 'measurement_inserted',
        data: {
          ...measurement.toObject(),
          type: data.type,
        },
      })

      return measurement
    } catch (error) {
      console.error('Error while inserting measurement', error)
      throw error
    }
  }

  async updateMeasurement(data: MeasurementData) {
    try {
      const Model = this.measurementModels[data.type]
      if (!Model) {
        throw new Error(`Unknown measurement type: ${data.type}`)
      }

      const measurement = await Model.findById(data._id)
      if (!measurement) {
        throw new Error('Measurement not found')
      }

      const oldValue = measurement.value
      measurement.value = data.value
      measurement.type = data.type
      await measurement.save()

      

      
      this.broadcastToFlower(measurement.flower_id.toString(), {
        type: 'measurement_updated',
        data: {
          ...measurement.toObject(),
          type: data.type,
        },
      })

      return measurement
    } catch (error) {
      console.error('Error while updating measurement', error)
      throw error
    }
  }
}

export const measurementService = new MeasurementService()
