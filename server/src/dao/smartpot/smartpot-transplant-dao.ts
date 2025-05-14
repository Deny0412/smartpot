import { Types } from 'mongoose'
import Flower from '../../models/Flower'
import SmartPot from '../../models/SmartPot'

export const smartpotTransplantDao = {
  async transplantWithFlower(smartPotId: string, targetHouseholdId: string) {
    const smartPot = await SmartPot.findById(smartPotId)
    if (!smartPot) throw new Error('Smart pot not found')

    
    const flower = await Flower.findById(smartPot.active_flower_id)
    
    if (!flower && smartPot.active_flower_id==null) {
      smartPot.household_id = new Types.ObjectId(targetHouseholdId)
      await smartPot.save()
      return { smartPot, flower: null }
    }else{
      smartPot.household_id = new Types.ObjectId(targetHouseholdId)
      await smartPot.save()
      flower.household_id = targetHouseholdId
      await flower.save()
      return { smartPot, flower: null }
    }

  },

  async transplantWithoutFlower(
    smartPotId: string,
    targetHouseholdId: string,
    assignOldFlower: boolean,
    newSmartPotId?: string
  ) {
    const smartPot = await SmartPot.findById(smartPotId)
    if (!smartPot) throw new Error('Smart pot not found')

  

    const oldFlower = await Flower.findById(smartPot.active_flower_id)
    if (!oldFlower) throw new Error('Flower not found')

    smartPot.active_flower_id = null
    await smartPot.save()

    oldFlower.serial_number = ''
    await oldFlower.save()

    if (assignOldFlower && newSmartPotId) {
      const newSmartPot = await SmartPot.findById(newSmartPotId)
      if (!newSmartPot) throw new Error('New smart pot not found')

      if (newSmartPot.active_flower_id !== null) {
        throw new Error('New smart pot is already occupied')
      }

      newSmartPot.active_flower_id = new Types.ObjectId(oldFlower._id)
      await newSmartPot.save()

      oldFlower.serial_number = newSmartPot.serial_number
      await oldFlower.save()
    }

    return { smartPot, oldFlower }
  },

  async transplantToFlower(smartPotId: string, targetFlowerId: string) {
    const smartPot = await SmartPot.findById(smartPotId)
    if (!smartPot) throw new Error('Smart pot not found')

    const targetFlower = await Flower.findById(targetFlowerId)
    if (!targetFlower) throw new Error('Target flower not found')

    if (smartPot.active_flower_id) {
      const oldFlower = await Flower.findById(smartPot.active_flower_id)
      if (oldFlower) {
        oldFlower.serial_number = ''
        await oldFlower.save()
      }
    }

    smartPot.active_flower_id = new Types.ObjectId(targetFlowerId)
    await smartPot.save()

    targetFlower.serial_number = smartPot.serial_number
    await targetFlower.save()

    return { smartPot, targetFlower }
  },
}
