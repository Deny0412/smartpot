import { Types } from 'mongoose'
import BatteryMeasurementModel from '../../models/BatteryMeasurement'
import HumidityMeasurementModel from '../../models/HumidityMeasurement'
import LightMeasurementModel from '../../models/LightMeasurement'
import TemperatureMeasurementModel from '../../models/TemperatureMeasurement'
import WaterMeasurementModel from '../../models/WaterMeasurement'

interface MeasurementRecord {
  _id: Types.ObjectId
  flower_id: Types.ObjectId
  value: number | string
  createdAt: Date
  type: 'water' | 'temperature' | 'light' | 'humidity' | 'battery'
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
    const fromDate = new Date(dateFrom)
    fromDate.setHours(0, 0, 0, 0)
    fromDate.setMinutes(fromDate.getMinutes() - fromDate.getTimezoneOffset())

    const toDate = new Date(dateTo)
    toDate.setHours(23, 59, 59, 999)
    toDate.setMinutes(toDate.getMinutes() - toDate.getTimezoneOffset())

    query.createdAt = {
      $gte: fromDate,
      $lte: toDate,
    }
  }

  console.log('Query parameters:', {
    flowerId: id,
    dateFrom,
    dateTo,
    query,
    fromDate: query.createdAt?.$gte,
    toDate: query.createdAt?.$lte,
  })

  const [waterRecords, humidityRecords, lightRecords, temperatureRecords, batteryRecords] = await Promise.all([
    WaterMeasurementModel.find(query).sort({ createdAt: -1 }).lean(),
    HumidityMeasurementModel.find(query).sort({ createdAt: -1 }).lean(),
    LightMeasurementModel.find(query).sort({ createdAt: -1 }).lean(),
    TemperatureMeasurementModel.find(query).sort({ createdAt: -1 }).lean(),
    BatteryMeasurementModel.find(query).sort({ createdAt: -1 }).lean(),
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
    ...(batteryRecords as any[]).map((record) => ({
      _id: record._id,
      flower_id: record.flower_id,
      value: record.value,
      createdAt: record.createdAt,
      type: 'battery' as const,
    })),
  ]

  return combinedRecords.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}
