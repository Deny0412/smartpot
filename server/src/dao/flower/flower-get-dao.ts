import FlowerModel from '../../models/Flower'
import FlowerProfileModel from '../../models/FlowerProfile'
import FlowerScheduleModel from '../../models/Schedule'

export async function getFlower(id: string) {
  const flower = await FlowerModel.findById(id).lean()
  if (!flower) return null

  let profile = flower.profile || {}

  // Ak má kvetina profile_id, načítame profil z FlowerProfile kolekcie
  if (flower.profile_id) {
    const flowerProfile = await FlowerProfileModel.findById(flower.profile_id).lean()
    if (flowerProfile) {
      profile = {
        humidity: flowerProfile.humidity,
        temperature: flowerProfile.temperature,
        light: flowerProfile.light,
      }
    }
  }

  return {
    ...flower,
    _id: flower._id.toString(),
    profile,
  }
}

export async function getFlowerSchedule(flowerId: string) {
  const flowerSchedule = await FlowerScheduleModel.findOne({ flower_id: flowerId }).lean()
  if (!flowerSchedule) {
    return null
  }
  return flowerSchedule
}
