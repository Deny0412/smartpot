import { FastifyReply } from 'fastify'
import { smartpotTransplantDao } from '../../dao/smartpot/smartpot-transplant-dao'
import { sendError, sendSuccess } from '../../middleware/response-handler'

export const smartpotTransplantAbl = {
  async transplantWithFlower(smartPotId: string, targetHouseholdId: string, reply: FastifyReply) {
    try {
      const result = await smartpotTransplantDao.transplantWithFlower(smartPotId, targetHouseholdId)
      return sendSuccess(reply, result, 'Smart pot transplanted successfully')
    } catch (error) {
      return sendError(reply, error)
    }
  },

  async transplantWithoutFlower(
    smartPotId: string,
    targetHouseholdId: string,
    assignOldFlower: boolean,
    newSmartPotId: string | undefined,
    reply: FastifyReply
  ) {
    try {
      const result = await smartpotTransplantDao.transplantWithoutFlower(
        smartPotId,
        targetHouseholdId,
        assignOldFlower,
        newSmartPotId
      )
      return sendSuccess(reply, result, 'Smart pot transplanted successfully')
    } catch (error) {
      return sendError(reply, error)
    }
  },

  async transplantToFlower(smartPotId: string, targetFlowerId: string, reply: FastifyReply) {
    try {
      const result = await smartpotTransplantDao.transplantToFlower(smartPotId, targetFlowerId)
      return sendSuccess(reply, result, 'Smart pot transplanted successfully')
    } catch (error) {
      return sendError(reply, error)
    }
  },
}
