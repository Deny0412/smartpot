import mongoose from 'mongoose'
import SmartPotModel, { ISmartPot } from '../../models/SmartPot'
import getSmartBySerialNumberPot from './smart-pot-get-by-serial-number'

async function updateSmartPot(smartpotData: ISmartPot) {
  const existingSmartPot = await getSmartBySerialNumberPot(smartpotData.serial_number)
  if (!existingSmartPot) {
    return null
  }
  console.log('existingSmartPot', existingSmartPot)

  // Prepare update data
  const updateData: any = {
    serial_number: smartpotData.serial_number,
  }

  // Only add fields if they exist or are explicitly null
  if (smartpotData.household_id !== undefined) {
    updateData.household_id = new mongoose.Types.ObjectId(smartpotData.household_id.toString())
  }

  // Explicitly handle active_flower_id
  if ('active_flower_id' in smartpotData) {
    if (smartpotData.active_flower_id === null) {
      updateData.active_flower_id = null
    } else if (smartpotData.active_flower_id) {
      updateData.active_flower_id = new mongoose.Types.ObjectId(smartpotData.active_flower_id.toString())
    }
  }

  console.log('Update data being applied:', updateData)

  const updatedSmartPot = await SmartPotModel.findOneAndUpdate(
    { serial_number: smartpotData.serial_number },
    { $set: updateData },
    { new: true, runValidators: true }
  )

  console.log('updatedSmartPot', updatedSmartPot)
  return updatedSmartPot
}

export default updateSmartPot
