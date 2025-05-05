import Ajv from 'ajv'
import { FastifyReply } from 'fastify'
import { Types } from 'mongoose'
import { getFlower } from '../../dao/flower/flower-get-dao'
import updateFlower from '../../dao/flower/flower-update-dao'
import smartpotGetBySerialNumberDao from '../../dao/smartpot/smart-pot-get-by-serial-number'
import { sendClientError, sendError, sendNotFound, sendSuccess } from '../../middleware/response-handler'
import { IFlower } from '../../models/Flower'
import { ISmartPot } from '../../models/SmartPot'
import { MongoValidator } from '../../validation/mongo-validator'
const ajv = new Ajv()
const SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    serial_number: { type: ['string', 'null'] },
    household_id: { type: 'string' },
    avatar: { type: 'string' },
    profile_id: { type: ['string', 'null'] },
    keepSmartPot: { type: 'boolean' },
    profile: {
      type: 'object',
      properties: {
        humidity: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
          },
        },
        temperature: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
          },
        },
        light: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
          },
        },
      },
    },
  },
  required: ['id'],
  additionalProperties: true,
}

async function updateFlowerHandler(data: IFlower, reply: FastifyReply) {
  try {
    console.log('=== ABL - Vstupné dáta ===')
    console.log('Data:', data)

    // Validate input data
    const validate = ajv.compile(SCHEMA)
    const valid = validate(data)
    if (!valid) {
      return sendClientError(reply, 'Invalid input data')
    }

    // Validate MongoDB ObjectId
    if (!MongoValidator.isValidObjectId(data.id)) {
      return sendClientError(reply, 'Invalid flower ID')
    }

    // Get existing flower
    const old_flower = await getFlower(data.id)
    if (!old_flower) {
      return sendNotFound(reply, 'Flower not found')
    }

    // Get smart pot if serial number is provided
    let new_smart_pot: ISmartPot | null = null
    if (data.serial_number) {
      new_smart_pot = await smartpotGetBySerialNumberDao(data.serial_number)
      if (!new_smart_pot) {
        return sendNotFound(reply, 'Smart pot not found')
      }
    }

    // Validate household consistency only if household_id is being changed
    if (data.household_id) {
      if (
        new_smart_pot?.household_id &&
        old_flower?.household_id &&
        !new_smart_pot.household_id.equals(old_flower.household_id) &&
        !data.household_id
      ) {
        sendClientError(reply, 'Flower must be from the same household as the smartpot')
        return
      }

      if (
        data.serial_number &&
        data.household_id &&
        new_smart_pot?.household_id &&
        !new_smart_pot.household_id.equals(new Types.ObjectId(data.household_id))
      ) {
        sendClientError(reply, 'Flower must be from the same household as the smartpot')
        return
      }

      // Handle household change
      if (
        data.household_id &&
        old_flower.household_id &&
        !new Types.ObjectId(data.household_id).equals(old_flower.household_id)
      ) {
        // Zachováme serial_number len ak je keepSmartPot true
        if (!data.keepSmartPot) {
          data.serial_number = null
        }
      }
    }

    console.log('=== ABL - Dáta pre aktualizáciu ===')
    console.log('Update data:', data)

    const updatedFlower = await updateFlower(String(data.id), data)

    if (!updatedFlower) {
      return sendNotFound(reply, 'Flower not found')
    }

    console.log('=== ABL - Výsledok aktualizácie ===')
    console.log('Updated flower:', updatedFlower)

    return sendSuccess(reply, updatedFlower, 'Flower updated successfully')
  } catch (error) {
    console.error('Error updating flower:', error)
    return sendError(reply, 'Failed to update flower')
  }
}

export default updateFlowerHandler
