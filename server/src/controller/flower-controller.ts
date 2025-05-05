import { FastifyReply, FastifyRequest } from 'fastify'
import flowerCreateAbl from '../abl/flower/flower-create-abl'
import flowerDeleteAbl from '../abl/flower/flower-delete-abl'
import flowerGetAbl from '../abl/flower/flower-get-abl'

import flowerListAbl from '../abl/flower/flower-list-abl'
import listActiveFlowersHandler from '../abl/flower/flower-list-active-abl'

import flowerExportAbl from '../abl/flower/flower-export-abl'
import flowerGetScheduleAbl from '../abl/flower/flower-schedule-get-abl'
import flowerUpdateScheduleAbl, { ScheduleData } from '../abl/flower/flower-schedule-update-abl'
import { flowerTransplantAbl } from '../abl/flower/flower-transplant-abl'
import flowerUpdateAbl from '../abl/flower/flower-update-abl'
import { sendError, sendInternalServerError } from '../middleware/response-handler'
import { IFlower } from '../models/Flower'

interface Params {
  id: string
}

interface HistoryQuery {
  flower_id: string
}

interface QueryParams {
  page: number
  household_id: string
  limit: number
}

export const flowerController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as IFlower
      await flowerCreateAbl(data, reply)
    } catch (error) {
      sendInternalServerError(reply)
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id
      await flowerDeleteAbl(id, reply)
      // The response tis handled in the ABL layer
    } catch (error) {
      sendError(reply, error)
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id
      await flowerGetAbl(id, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('List flowers - Query params:', request.query)
      await flowerListAbl(request, reply)
    } catch (error) {
      console.error('List flowers - Error:', error)
      sendError(reply, error)
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('=== Controller - Aktualizácia kvetiny ===')
      console.log('Request body:', request.body)

      const data = request.body as IFlower
      await flowerUpdateAbl(data, reply)
    } catch (error) {
      console.error('=== Controller - Chyba pri aktualizácii ===')
      console.error('Chyba:', error)
      sendError(reply, error)
    }
  },

  listActive: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.query as QueryParams
      await listActiveFlowersHandler(data, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  getSchedule: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id
      await flowerGetScheduleAbl(id, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  updateSchedule: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as ScheduleData
      await flowerUpdateScheduleAbl(data, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  export: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.body as { id: string }
      if (!id) {
        return reply.status(400).send({
          status: 'error',
          message: 'Flower ID is required',
        })
      }
      await flowerExportAbl(id, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  async transplantWithSmartPot(request: FastifyRequest, reply: FastifyReply) {
    const { flowerId, targetHouseholdId } = request.body as {
      flowerId: string
      targetHouseholdId: string
    }

    await flowerTransplantAbl.transplantWithSmartPot(flowerId, targetHouseholdId, reply)
  },
  async transplantWithoutSmartPot(request: FastifyRequest, reply: FastifyReply) {
    const { flowerId, targetHouseholdId, assignOldSmartPot, newFlowerId } = request.body as {
      flowerId: string
      targetHouseholdId: string
      assignOldSmartPot: boolean
      newFlowerId?: string
    }

    await flowerTransplantAbl.transplantWithoutSmartPot(
      flowerId,
      targetHouseholdId,
      assignOldSmartPot,
      newFlowerId,
      reply
    )
  },
  async transplantToSmartPot(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { flowerId, targetSmartPotId } = request.body as { flowerId: string; targetSmartPotId: string }

      // Validácia vstupných parametrov
      if (!flowerId || !targetSmartPotId) {
        return sendError(reply, new Error('Flower ID and target smart pot ID are required'))
      }

      await flowerTransplantAbl.transplantToSmartPot(flowerId, targetSmartPotId, reply)
    } catch (error) {
      console.error('Transplant to smart pot error:', error)
      sendError(reply, error)
    }
  },
}
