import { FastifyReply } from 'fastify'

import {getFlowerSchedule} from '../../dao/flower/flower-get-dao'
import { sendClientError, sendError, sendSuccess } from '../../middleware/response-handler'
import { MongoValidator } from '../../validation/mongo-validator'

async function getFlowerScheduleHandler(id: string, reply: FastifyReply) {
  try {
    if (!MongoValidator.validateId(id)) {
      return sendClientError(reply, 'Invalid flower ID format')
    }

    const flowerSchedule = await getFlowerSchedule(id)
    return sendSuccess(reply, flowerSchedule, 'Flower schedule retrieved successfully')
  } catch (error) {
    return sendError(reply, error)
  }
}

export default getFlowerScheduleHandler
