import { FastifyReply } from 'fastify'
import smartpotGetDao from '../../dao/smartpot/smart-pot-get-dao' // Adjust the import based on your DAO structure
import { sendClientError, sendError, sendNotFound, sendSuccess } from '../../middleware/response-handler'

async function getEmptySmartPotHandler(householdId: string, reply: FastifyReply) {
  try {
   

    const emptySmartPots = await smartpotGetDao.getEmptySmartPotsByHousehold(householdId)

    if (!emptySmartPots || emptySmartPots.length === 0) {
      sendNotFound(reply, 'Nenašli sa žiadne prázdne smartpots pre danú domácnosť')
      return
    }

    sendSuccess(reply, emptySmartPots, 'Prázdne smartpots boli úspešne nájdené')
  } catch (error) {
    sendError(reply, error)
  }
}

export default getEmptySmartPotHandler
