import { FastifyReply } from 'fastify'
import smartpotGetDao from '../../dao/smartpot/smart-pot-get-dao' // Adjust the import based on your DAO structure
import { sendClientError, sendError, sendNotFound, sendSuccess } from '../../middleware/response-handler'

async function getEmptySmartPotHandler(householdId: string, reply: FastifyReply) {
  try {
   

    const emptySmartPots = await smartpotGetDao.getEmptySmartPotsByHousehold(householdId)

    if (!emptySmartPots || emptySmartPots.length === 0) {
      sendNotFound(reply, 'No empty smartpots found for the household')
      return
    }

    sendSuccess(reply, emptySmartPots, 'Empty smartpots found successfully')
  } catch (error) {
    sendError(reply, error)
  }
}

export default getEmptySmartPotHandler
