import BatteryMeasurementModel from '../../models/BatteryMeasurement'
import FlowerModel from '../../models/Flower'
import LightMeasurementModel from '../../models/LightMeasurement'
import ScheduleModel from '../../models/Schedule'
import SmartPotModel from '../../models/SmartPot'
import TemperatureMeasurementModel from '../../models/TemperatureMeasurement'
import WaterModel from '../../models/WaterMeasurement'
import HumidityMeasurementModel from '../../models/HumidityMeasurement'

async function deleteFlower(id: string) {

  await SmartPotModel.updateMany({ active_flower_id: id }, { $set: { active_flower_id: null } })

  await ScheduleModel.deleteMany({ flower_id: id })
  await BatteryMeasurementModel.deleteMany({ flower_id: id })
  await WaterModel.deleteMany({ flower_id: id })
  await TemperatureMeasurementModel.deleteMany({ flower_id: id })
  await LightMeasurementModel.deleteMany({ flower_id: id })
  await HumidityMeasurementModel.deleteMany({ flower_id: id })

  const deletedFlower = await FlowerModel.findByIdAndDelete(id)
  return deletedFlower
}

export default deleteFlower