import { FastifyReply, FastifyRequest } from 'fastify'
import SmartPotAblUpdate from '../abl/smartpot/smart-pot-update-abl'
import smartpotCreateAbl from '../abl/smartpot/smartpot-create-abl'
import smartpotEmptyAbl from '../abl/smartpot/smartpot-empty-abl'
import smartpotGetAbl from '../abl/smartpot/smartpot-get-abl'
import smartpotGetByHouseholdAbl from '../abl/smartpot/smartpot-get-by-household-abl'
import { sendClientError, sendCreated, sendError, sendSuccess } from '../middleware/response-handler'
import { ISmartPot } from '../models/SmartPot'

interface Params {
  id: string
}
export const smartpotController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as ISmartPot
      const response = await smartpotCreateAbl(data, reply)
      sendCreated(reply, response, 'SmartPot created successfully')
    } catch (error) {
      sendError(reply, error)
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id
      const response = await smartpotGetAbl(id, reply)
      sendSuccess(reply, response, 'SmartPot retrieved successfully')
    } catch (error) {
      sendError(reply, error)
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user
      const data = request.body as ISmartPot
      const response = await SmartPotAblUpdate(data, reply)
      sendSuccess(reply, response, 'SmartPot updated successfully')
    } catch (error) {
      sendError(reply, error)
    }
  },
  empty: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const householdId = (request.query as { household_id: string }).household_id
      if (!householdId) {
        return sendClientError(reply, 'Chýbajúci parameter household_id')
      }
      const response = await smartpotEmptyAbl(householdId, reply)
      return response
    } catch (error) {
      sendError(reply, error)
    }
  },
  getByHousehold: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const householdId = (request.params as Params).id
      const response = await smartpotGetByHouseholdAbl(householdId, reply)
      sendSuccess(reply, response, 'SmartPots retrieved successfully')
    } catch (error) {
      sendError(reply, error)
    }
  },
}
