import { FastifyReply, FastifyRequest } from 'fastify'
import measurementHistoryAbl, { getLatestMeasurementsAbl } from '../abl/measurement/measurement-history-abl'
import { sendError } from '../middleware/response-handler'
import measurementCreateAbl from '../abl/measurement/measurement-create-abl'

interface RequestBody {
  id: string
  householdId: string
  dateFrom?: string
  dateTo?: string
}

export const measurementController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as Object;
      const user = request.user as Object;
      await measurementCreateAbl(data, reply, user);
    } catch (error) {
      sendError(reply, error);
    }
  },
  history: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as RequestBody

      if (!body.householdId) {
        throw new Error('Missing householdId')
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

  getLatest: async (request: FastifyRequest, reply: FastifyReply) => {
    await getLatestMeasurementsAbl(request.body as any, reply)
  },
}
