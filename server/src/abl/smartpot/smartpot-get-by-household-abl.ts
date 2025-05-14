import { FastifyReply } from 'fastify'

import { sendClientError, sendError, sendNotFound } from '../../middleware/response-handler'
import { MongoValidator } from '../../validation/mongo-validator'

import smartPotsListHouseholdDao from '../../dao/smartpot/smart-pot-get-dao'

async function getSmartPotByHouseholdHandler(householdId: string, reply: FastifyReply) {
  try {
    if (!MongoValidator.validateId(householdId)) {
      return sendClientError(reply, 'Invalid household ID format')
    }

    const smartpots = await smartPotsListHouseholdDao.getSmartPotsByHousehold(householdId)
    if (!smartpots || smartpots.length === 0) {
      return sendNotFound(reply, 'No SmartPots found for this household')
    }
    return smartpots
  } catch (error) {
    return sendError(reply, error)
  }
}

export default getSmartPotByHouseholdHandler
