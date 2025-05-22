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

  setFastify(fastify: FastifyInstance) {
    this.fastify = fastify
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
      console.log(`[MEASUREMENT SERVICE] Saved new ${data.type} measurement for flower ${data.flower_id}`)

      return measurement
    } catch (error) {
      console.error('[MEASUREMENT SERVICE] Error while inserting measurement:', error)
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

      return measurement
    } catch (error) {
      console.error('[MEASUREMENT SERVICE] Error while updating measurement:', error)
      throw error
    }
  }
}

export const measurementService = new MeasurementService()
