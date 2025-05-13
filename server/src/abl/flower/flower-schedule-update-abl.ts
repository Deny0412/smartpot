import Ajv from 'ajv'
import { FastifyReply } from 'fastify'
import { getFlowerSchedule } from '../../dao/flower/flower-get-dao'
import updateFlowerSchedule from '../../dao/flower/flower-schedule-update-dao'
import { sendClientError, sendError, sendSuccess } from '../../middleware/response-handler'
import { MongoValidator } from '../../validation/mongo-validator'

export interface ScheduleData {
  flower_id: string
  active: boolean
  monday: { from: string | null; to: string | null }
  tuesday: { from: string | null; to: string | null }
  wednesday: { from: string | null; to: string | null }
  thursday: { from: string | null; to: string | null }
  friday: { from: string | null; to: string | null }
  saturday: { from: string | null; to: string | null }
  sunday: { from: string | null; to: string | null }
}

const ajv = new Ajv()

const SCHEMA = {
  type: 'object',
  properties: {
    flower_id: { type: 'string' },
    active: { type: 'boolean' },
    monday: {
      type: 'object',
      properties: {
        from: { type: ['string', 'null'] },
        to: { type: ['string', 'null'] },
      },
    },
    tuesday: {
      type: 'object',
      properties: {
        from: { type: ['string', 'null'] },
        to: { type: ['string', 'null'] },
      },
    },
    wednesday: {
      type: 'object',
      properties: {
        from: { type: ['string', 'null'] },
        to: { type: ['string', 'null'] },
      },
    },
    thursday: {
      type: 'object',
      properties: {
        from: { type: ['string', 'null'] },
        to: { type: ['string', 'null'] },
      },
    },
    friday: {
      type: 'object',
      properties: {
        from: { type: ['string', 'null'] },
        to: { type: ['string', 'null'] },
      },
    },
    saturday: {
      type: 'object',
      properties: {
        from: { type: ['string', 'null'] },
        to: { type: ['string', 'null'] },
      },
    },
    sunday: {
      type: 'object',
      properties: {
        from: { type: ['string', 'null'] },
        to: { type: ['string', 'null'] },
      },
    },
  },
  required: ['flower_id', 'active'],
  additionalProperties: true,
}

async function updateFlowerScheduleHandler(data: ScheduleData, reply: FastifyReply) {
  try {
    const validate = ajv.compile(SCHEMA)
    const isValid = validate(data)
    if (!isValid) {
      console.log('Validation errors:', validate.errors)
      return sendClientError(reply, JSON.stringify(validate.errors?.map((error) => error.message)))
    }

    const valid = MongoValidator.validateId(data.flower_id)
    if (!valid) {
      return sendClientError(reply, 'Invalid flower ID format')
    }

    
    const existingSchedule = await getFlowerSchedule(data.flower_id)
    if (!existingSchedule) {
      return sendClientError(reply, 'Schedule not found')
    }

    const updatedSchedule = await updateFlowerSchedule(data.flower_id, data)
    if (!updatedSchedule) {
      return sendError(reply, 'Failed to update schedule')
    }

    return sendSuccess(reply, updatedSchedule, 'Schedule updated successfully')
  } catch (error) {
    console.error('Error updating schedule:', error)
    return sendError(reply, 'Failed to update schedule')
  }
}

export default updateFlowerScheduleHandler
