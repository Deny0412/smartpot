import { FastifyReply } from 'fastify'
import smartpotGetDao from '../../dao/smartpot/smart-pot-get-dao'
import { sendClientError, sendError, sendNotFound, sendSuccess } from '../../middleware/response-handler'
import { MongoValidator } from '../../validation/mongo-validator'

async function getSmartPotHandler(id: string, reply: FastifyReply) {
  try {
    if (!MongoValidator.validateId(id)) {
      return sendClientError(reply, 'Invalid smartpot ID format')
    }

    const smartpot = await smartpotGetDao.getSmartPot(id)
    if (!smartpot) {
      return sendNotFound(reply, 'SmartPot not found')
    }
    return sendSuccess(reply, smartpot, 'SmartPot retrieved successfully')
  } catch (error) {
    return sendError(reply, error)
  }
}

export default getSmartPotHandler
