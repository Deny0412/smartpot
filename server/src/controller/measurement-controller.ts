import { FastifyReply, FastifyRequest } from 'fastify'
import measurementHistoryAbl from '../abl/measurement/measurement-history-abl'
import { sendError } from '../middleware/response-handler'

interface RequestBody {
  id: string
  householdId: string
  dateFrom?: string
  dateTo?: string
}

export const measurementController = {
  history: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as RequestBody

      if (!body.householdId) {
        throw new Error('Chýba householdId v tele požiadavky')
      }

      await measurementHistoryAbl(
        {
          id: body.id,
          householdId: body.householdId,
          dateFrom: body.dateFrom,
          dateTo: body.dateTo,
        },
        reply
      )
    } catch (error) {
      sendError(reply, error)
    }
  },
}
