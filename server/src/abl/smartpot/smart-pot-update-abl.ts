import Ajv from 'ajv'
import { FastifyReply } from 'fastify'
import mongoose from 'mongoose'
import getSmartBySerialNumberPot from '../../dao/smartpot/smart-pot-get-by-serial-number'
import smartpotUpdateDao from '../../dao/smartpot/smart-pot-update-dao'
import { sendClientError, sendError, sendNotFound, sendSuccess } from '../../middleware/response-handler'
import { ISmartPot } from '../../models/SmartPot'
const ajv = new Ajv()

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id)
}

const schema = {
  type: 'object',
  properties: {
    serial_number: { type: 'string' },
    active_flower_id: { type: 'string', nullable: true },
    household_id: { type: 'string', nullable: true },
  },
  required: ['serial_number'],
}

// Add this type to handle the update data
interface SmartPotUpdateData {
  serial_number: string
  household_id?: mongoose.Types.ObjectId
  active_flower_id?: mongoose.Types.ObjectId | null
}

export const SmartPotAblUpdate = async (data: ISmartPot, reply: FastifyReply) => {
  try {
    console.log('Update input data:', data)

    // Validácia vstupných dát
    if (!data.serial_number) {
      console.error('Missing serial_number')
      return sendClientError(reply, 'Chýbajúci parameter serial_number')
    }

    // Získanie existujúceho smart potu
    const existingSmartPot = await getSmartBySerialNumberPot(data.serial_number)
    console.log('Existing smart pot:', existingSmartPot)

    if (!existingSmartPot) {
      console.error('Smart pot not found with serial number:', data.serial_number)
      return sendNotFound(reply, 'SmartPot not found')
    }

    // Vytvorenie update objektu
    const updateData = {
      serial_number: data.serial_number,
      household_id: data.household_id ? new mongoose.Types.ObjectId(data.household_id) : existingSmartPot.household_id,
      active_flower_id: data.active_flower_id
        ? new mongoose.Types.ObjectId(data.active_flower_id)
        : existingSmartPot.active_flower_id,
    }
    console.log('Update data:', updateData)

    // Aktualizácia smart potu
    const updatedSmartPot = await smartpotUpdateDao(updateData as ISmartPot)
    console.log('Updated smart pot:', updatedSmartPot)

    if (!updatedSmartPot) {
      console.error('Failed to update smart pot')
      return sendError(reply, 'Failed to update smart pot')
    }

    return sendSuccess(reply, updatedSmartPot, 'SmartPot updated successfully')
  } catch (error) {
    console.error('Error in SmartPotAblUpdate:', error)
    return sendError(reply, error)
  }
}

export default SmartPotAblUpdate
