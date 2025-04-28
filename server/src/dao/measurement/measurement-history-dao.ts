import { Types } from 'mongoose'
import HumidityMeasurementModel from '../../models/HumidityMeasurement'
import LightMeasurementModel from '../../models/LightMeasurement'
import TemperatureMeasurementModel from '../../models/TemperatureMeasurement'
import WaterMeasurementModel from '../../models/WaterMeasurement'

interface MeasurementRecord {
  _id: Types.ObjectId
  flower_id: Types.ObjectId
  value: number | string
  createdAt: Date
  type: 'water' | 'temperature' | 'light' | 'humidity'
}

interface MeasurementHistoryRequest {
  id: string
  dateFrom?: string
  dateTo?: string
}

export default async function measurementHistoryDao(data: MeasurementHistoryRequest) {
  const { id, dateFrom, dateTo } = data
  const query: any = { flower_id: new Types.ObjectId(id) }

  if (dateFrom && dateTo) {
    query.createdAt = {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    }
  }

  const [waterRecords, humidityRecords, lightRecords, temperatureRecords] = await Promise.all([
    WaterMeasurementModel.find(query).sort({ createdAt: 1 }).lean(),
    HumidityMeasurementModel.find(query).sort({ createdAt: 1 }).lean(),
    LightMeasurementModel.find(query).sort({ createdAt: 1 }).lean(),
    TemperatureMeasurementModel.find(query).sort({ createdAt: 1 }).lean(),
  ])

  const combinedRecords: MeasurementRecord[] = [
    ...(waterRecords as any[]).map((record) => ({
      _id: record._id,
      flower_id: record.flower_id,
      value: record.value,
      createdAt: record.createdAt,
      type: 'water' as const,
    })),
    ...(humidityRecords as any[]).map((record) => ({
      _id: record._id,
      flower_id: record.flower_id,
      value: record.value,
      createdAt: record.createdAt,
      type: 'humidity' as const,
    })),
    ...(lightRecords as any[]).map((record) => ({
      _id: record._id,
      flower_id: record.flower_id,
      value: record.value,
      createdAt: record.createdAt,
      type: 'light' as const,
    })),
    ...(temperatureRecords as any[]).map((record) => ({
      _id: record._id,
      flower_id: record.flower_id,
      value: record.value,
      createdAt: record.createdAt,
      type: 'temperature' as const,
    })),
  ]

  return combinedRecords.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}
