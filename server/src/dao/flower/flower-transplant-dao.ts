import { Types } from 'mongoose'
import Flower from '../../models/Flower'
import SmartPot from '../../models/SmartPot'

export const flowerTransplantDao = {
  async transplantWithSmartPot(flowerId: string, targetHouseholdId: string) {
    const flower = await Flower.findById(flowerId)
    if (!flower) throw new Error('Flower not found')

    const smartPot = await SmartPot.findOne({ active_flower_id: new Types.ObjectId(flowerId) })
    if (!smartPot) throw new Error('Smart pot not found')

    smartPot.household_id = new Types.ObjectId(targetHouseholdId)
    await smartPot.save()

    flower.household_id = targetHouseholdId
    await flower.save()

    return { flower, smartPot }
  },

  async transplantWithoutSmartPot(
    flowerId: string,
    targetHouseholdId: string,
    assignOldSmartPot: boolean,
    newFlowerId?: string
  ) {
    const flower = await Flower.findById(flowerId)
    if (!flower) throw new Error('Flower not found')

    if (!flower.serial_number) {
      flower.household_id = targetHouseholdId
      await flower.save()
      return { flower, oldSmartPot: null }
    }

    const oldSmartPot = await SmartPot.findOne({ active_flower_id: new Types.ObjectId(flowerId) })
    if (!oldSmartPot) throw new Error('Smart pot not found')

    oldSmartPot.active_flower_id = null
    await oldSmartPot.save()

    flower.serial_number = ''
    flower.household_id = targetHouseholdId
    await flower.save()

    if (assignOldSmartPot && newFlowerId) {
      const newFlower = await Flower.findById(newFlowerId)
      if (!newFlower) throw new Error('New flower not found')

      if (newFlower.serial_number !== '' && newFlower.serial_number !== null) {
        throw new Error('New flower already has a smart pot')
      }

      newFlower.serial_number = oldSmartPot.serial_number
      await newFlower.save()

      oldSmartPot.active_flower_id = new Types.ObjectId(newFlowerId)
      await oldSmartPot.save()
    }

    return { flower, oldSmartPot }
  },

  async transplantToSmartPot(flowerId: string, targetSmartPotId: string) {
    const flower = await Flower.findById(flowerId)
    if (!flower) throw new Error('Flower not found')

    const targetSmartPot = await SmartPot.findById(targetSmartPotId)
    if (!targetSmartPot) throw new Error('Target smart pot not found')

    if (flower.serial_number !== '' || flower.serial_number !== null) {
      const oldSmartPot = await SmartPot.findOne({ active_flower_id: flower._id })
      if (oldSmartPot) {
        oldSmartPot.active_flower_id = null
        await oldSmartPot.save()
      }
    }

    if (targetSmartPot.active_flower_id !== null) {
      throw new Error('Target smart pot is already occupied')
    }

    flower.serial_number = targetSmartPot.serial_number
    await flower.save()

    targetSmartPot.active_flower_id = new Types.ObjectId(flowerId)
    await targetSmartPot.save()

    return { flower, targetSmartPot }
  },
}
