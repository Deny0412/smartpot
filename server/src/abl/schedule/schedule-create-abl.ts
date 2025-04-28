import { FastifyReply } from 'fastify'
import { getFlower } from '../../dao/flower/flower-get-dao'
import { createSchedule } from '../../dao/schedule/schedule-create-dao'
import { sendClientError, sendCreated, sendError } from '../../middleware/response-handler'
import { ISchedule } from '../../models/Schedule'
import { MongoValidator } from '../../validation/mongo-validator'
import { validateCreateSchedule } from '../../validation/schedule-validation'

export default async function scheduleCreateAbl(data: ISchedule, reply: FastifyReply) {
  try {
    // Validácia dát
    const isValid = validateCreateSchedule(data)
    if (!isValid) {
      return sendClientError(reply, JSON.stringify(validateCreateSchedule.errors?.map((error) => error.message)))
    }

    if (!data.flower_id) {
      return sendError(reply, { message: 'Chýbajúce ID kvetiny' }, 400)
    }

    // Validácia formátu ID
    if (!MongoValidator.validateId(data.flower_id)) {
      return sendClientError(reply, 'Neplatný formát ID kvetiny')
    }

    const flower = await getFlower(data.flower_id)
    if (!flower) {
      return sendError(reply, { message: 'Kvetina nebola nájdená' }, 404)
    }

    const schedule = await createSchedule({
      ...data,
      active: data.active || false,
      monday: data.monday || { from: '', to: '' },
      tuesday: data.tuesday || { from: '', to: '' },
      wednesday: data.wednesday || { from: '', to: '' },
      thursday: data.thursday || { from: '', to: '' },
      friday: data.friday || { from: '', to: '' },
      saturday: data.saturday || { from: '', to: '' },
      sunday: data.sunday || { from: '', to: '' },
    })

    return sendCreated(reply, schedule, 'Rozvrh bol úspešne vytvorený')
  } catch (error) {
    console.error('Chyba pri vytváraní rozvrhu:', error)
    return sendError(reply, error)
  }
}
