import mongoose from 'mongoose'
import SmartPotModel from '../../models/SmartPot'

async function getSmartPot(id: string) {
  const smartpot = await SmartPotModel.findById(id)
  return smartpot
}

async function getSmartPotsByHousehold(householdId: string) {
  const smartpots = await SmartPotModel.find({
    household_id: new mongoose.Types.ObjectId(householdId),
  })
  return smartpots
}

async function getEmptySmartPotsByHousehold(householdId: string) {
  const emptySmartPots = await SmartPotModel.find({
    household_id: new mongoose.Types.ObjectId(householdId),
    active_flower_id: { $exists: true, $eq: null },
  })
  return emptySmartPots
}

export default {
  getSmartPot,
  getSmartPotsByHousehold,
  getEmptySmartPotsByHousehold,
}
