import { FastifyReply } from 'fastify'
import { flowerTransplantDao } from '../../dao/flower/flower-transplant-dao'
import { sendError, sendSuccess } from '../../middleware/response-handler'

export const flowerTransplantAbl = {
  async transplantWithSmartPot(flowerId: string, targetHouseholdId: string, reply: FastifyReply) {
    try {
      const result = await flowerTransplantDao.transplantWithSmartPot(flowerId, targetHouseholdId)
      return sendSuccess(reply, result, 'Flower transplanted successfully')
    } catch (error) {
      return sendError(reply, error)
    }
  },

  async transplantWithoutSmartPot(
    flowerId: string,
    targetHouseholdId: string,
    assignOldSmartPot: boolean,
    newFlowerId: string | undefined,
    reply: FastifyReply
  ) {
    try {
      const result = await flowerTransplantDao.transplantWithoutSmartPot(
        flowerId,
        targetHouseholdId,
        assignOldSmartPot,
        newFlowerId
      )
      return sendSuccess(reply, result, 'Flower transplanted successfully')
    } catch (error) {
      return sendError(reply, error)
    }
  },

  async transplantToSmartPot(flowerId: string, targetSmartPotId: string, reply: FastifyReply) {
    try {
      console.log('Transplant to smart pot ABL - Input:', { flowerId, targetSmartPotId })

      if (!flowerId || !targetSmartPotId) {
        throw new Error('Flower ID and target smart pot ID are required')
      }

      const result = await flowerTransplantDao.transplantToSmartPot(flowerId, targetSmartPotId)
      console.log('Transplant to smart pot ABL - Result:', result)
      return sendSuccess(reply, result, 'Flower transplanted successfully')
    } catch (error) {
      console.error('Transplant to smart pot ABL error:', error)
      return sendError(reply, error)
    }
  },
}
