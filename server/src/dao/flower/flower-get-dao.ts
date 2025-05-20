import { Types } from 'mongoose'
import FlowerModel from '../../models/Flower'
import FlowerScheduleModel from '../../models/Schedule'

export async function getFlower(id: string) {
  const flower = await FlowerModel.findById(id).lean()
  if (!flower) return null


  return {
    ...flower,
    _id: flower._id.toString(),
  }
}

export async function getFlowerSchedule(flowerId: string) {
  const flowerSchedule = await FlowerScheduleModel.findOne({ flower_id: flowerId }).lean()
  if (!flowerSchedule) {
    
    return null
  }
  return flowerSchedule
}
