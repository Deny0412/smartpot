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

export async function getLatestMeasurementsDao(flowerId: string) {
  const query = { flower_id: new Types.ObjectId(flowerId) }

  const [waterRecord, humidityRecord, lightRecord, temperatureRecord, batteryRecord] = await Promise.all([
    WaterMeasurementModel.findOne(query).sort({ createdAt: -1 }).lean(),
    HumidityMeasurementModel.findOne(query).sort({ createdAt: -1 }).lean(),
    LightMeasurementModel.findOne(query).sort({ createdAt: -1 }).lean(),
    TemperatureMeasurementModel.findOne(query).sort({ createdAt: -1 }).lean(),
    BatteryMeasurementModel.findOne(query).sort({ createdAt: -1 }).lean(),
  ])

  const latestMeasurements = {
    water: waterRecord
      ? {
          _id: waterRecord._id,
          flower_id: waterRecord.flower_id,
          value: waterRecord.value,
          createdAt: waterRecord.createdAt,
          type: 'water' as const,
        }
      : null,
    humidity: humidityRecord
      ? {
          _id: humidityRecord._id,
          flower_id: humidityRecord.flower_id,
          value: humidityRecord.value,
          createdAt: humidityRecord.createdAt,
          type: 'humidity' as const,
        }
      : null,
    light: lightRecord
      ? {
          _id: lightRecord._id,
          flower_id: lightRecord.flower_id,
          value: lightRecord.value,
          createdAt: lightRecord.createdAt,
          type: 'light' as const,
        }
      : null,
    temperature: temperatureRecord
      ? {
          _id: temperatureRecord._id,
          flower_id: temperatureRecord.flower_id,
          value: temperatureRecord.value,
          createdAt: temperatureRecord.createdAt,
          type: 'temperature' as const,
        }
      : null,
    battery: batteryRecord
      ? {
          _id: batteryRecord._id,
          flower_id: batteryRecord.flower_id,
          value: batteryRecord.value,
          createdAt: batteryRecord.createdAt,
          type: 'battery' as const,
        }
      : null,
  }

  return latestMeasurements
}
