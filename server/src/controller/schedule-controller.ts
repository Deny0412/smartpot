import { FastifyReply, FastifyRequest } from 'fastify'
import scheduleCreateAbl from '../abl/schedule/schedule-create-abl'
import scheduleGetAbl from '../abl/schedule/schedule-get-abl'
import scheduleUpdateAbl from '../abl/schedule/schedule-update-abl'
import { sendError, sendSuccess } from '../middleware/response-handler'
import { ISchedule } from '../models/Schedule'

interface Params {
  id: string
}
export const scheduleController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as ISchedule
      const response = await scheduleCreateAbl(data, reply)
      return response
    } catch (error) {
      return sendError(reply, error)
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id
      const response = await scheduleGetAbl(id, reply)
      return sendSuccess(reply, response, 'Schedule retrieved successfully')
    } catch (error) {
      return sendError(reply, error)
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await scheduleUpdateAbl(request.body as ISchedule, reply)
      return sendSuccess(reply, response, 'Schedule updated successfully')
    } catch (error) {
      return sendError(reply, error)
    }
  },
}
