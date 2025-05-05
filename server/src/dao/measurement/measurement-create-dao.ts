import { Types } from 'mongoose'
import HumidityModel from '../../models/HumidityMeasurement'
import LightModel from '../../models/LightMeasurement'
import { IMeasurement } from '../../models/Measurement'
import TemperatureModel from '../../models/TemperatureMeasurement'
import WaterModel from '../../models/WaterMeasurement'

async function createMeasurement(data: IMeasurement) {
  const { flower_id, humidity, temperature, light, water_level } = data
  const flowerId = new Types.ObjectId(flower_id)

  const measurements = []

  if (humidity !== null && humidity !== undefined) {
    const humidityMeasurement = await HumidityModel.create({
      flower_id: flowerId,
      value: humidity,
    })
    measurements.push(humidityMeasurement)
  }

  if (temperature !== null && temperature !== undefined) {
    const temperatureMeasurement = await TemperatureModel.create({
      flower_id: flowerId,
      value: temperature,
    })
    measurements.push(temperatureMeasurement)
  }

  if (light !== null && light !== undefined) {
    const lightMeasurement = await LightModel.create({
      flower_id: flowerId,
      value: light,
    })
    measurements.push(lightMeasurement)
  }

  if (water_level !== null && water_level !== undefined) {
    const waterMeasurement = await WaterModel.create({
      flower_id: flowerId,
      value: water_level,
    })
    measurements.push(waterMeasurement)
  }

  return measurements
}

export default createMeasurement
